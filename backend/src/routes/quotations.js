import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/v1/quotations
 * Vendor submits a quotation response for an RFQ.
 */
router.post('/', requireAuth, requireRole('vendor'), async (req, res) => {
    const { rfq_id, validity_days, delivery_days, payment_terms, notes, items } = req.body;

    if (!rfq_id || !delivery_days || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Missing required fields: rfq_id, delivery_days, items[]' });
    }

    try {
        // 1. Fetch vendor record corresponding to user_id
        const { data: vendor, error: vError } = await supabase
            .from('vendors')
            .select('id, payment_terms')
            .eq('user_id', req.user.id)
            .single();

        if (vError || !vendor) {
            return res.status(404).json({ error: 'Vendor profile not found for this authenticated user.' });
        }

        // 2. Verify RFQ exists and is open
        const { data: rfq, error: rfqError } = await supabase
            .from('rfqs')
            .select('status')
            .eq('id', rfq_id)
            .single();

        if (rfqError || !rfq) {
            return res.status(404).json({ error: 'RFQ not found' });
        }

        if (rfq.status !== 'open') {
            return res.status(400).json({ error: `Cannot submit quotation. RFQ is currently in '${rfq.status}' status.` });
        }

        // 3. Calculate total amount based on items
        let totalAmount = 0;
        items.forEach(item => {
            totalAmount += parseFloat(item.quantity) * parseFloat(item.unit_price);
        });

        // 4. Generate sequential quotation number
        const countQuery = await supabase.from('quotations').select('id', { count: 'exact', head: true });
        const seq = (countQuery.count || 0) + 1;
        const quotationNumber = `QUO-2026-${String(seq).padStart(4, '0')}`;

        // 5. Insert quotation header
        const { data: quotation, error: qError } = await supabase
            .from('quotations')
            .insert({
                quotation_number: quotationNumber,
                rfq_id,
                vendor_id: vendor.id,
                status: 'submitted',
                total_amount: totalAmount,
                validity_days: validity_days || 30,
                delivery_days,
                payment_terms: payment_terms || `${vendor.payment_terms} Days`,
                notes
            })
            .select()
            .single();

        if (qError) throw qError;

        // 6. Insert quotation line items
        const qItemsToInsert = items.map(item => ({
            quotation_id: quotation.id,
            rfq_item_id: item.rfq_item_id,
            item_name: item.item_name,
            quantity: item.quantity,
            unit: item.unit || 'pcs',
            unit_price: item.unit_price,
            tax_rate: item.tax_rate || 18.00 // Default GST
        }));

        const { data: insertedItems, error: qiError } = await supabase
            .from('quotation_items')
            .insert(qItemsToInsert)
            .select();

        if (qiError) throw qiError;

        // 7. Update rfq_vendors responded = true
        await supabase
            .from('rfq_vendors')
            .update({ responded: true })
            .eq('rfq_id', rfq_id)
            .eq('vendor_id', vendor.id);

        return res.status(201).json({
            success: true,
            message: 'Quotation submitted successfully.',
            data: {
                ...quotation,
                items: insertedItems
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/v1/quotations/rfq/:rfqId
 * Lists all quotations submitted for a specific RFQ.
 */
router.get('/rfq/:rfqId', requireAuth, async (req, res) => {
    const { rfqId } = req.params;

    try {
        const { data: quotations, error } = await supabase
            .from('quotations')
            .select('*, vendors(company_name, rating_avg)')
            .eq('rfq_id', rfqId)
            .order('total_amount', { ascending: true });

        if (error) throw error;

        return res.json({
            success: true,
            data: quotations
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/v1/quotations/compare/:rfqId
 * ⭐ HACKATHON STAR FEATURE: Comparison Matrix Engine
 * Returns a grid mapping RFQ items to vendor quotes, computing price rankings.
 */
router.get('/compare/:rfqId', requireAuth, async (req, res) => {
    const { rfqId } = req.params;

    try {
        // 1. Fetch RFQ header
        const { data: rfq, error: rfqError } = await supabase
            .from('rfqs')
            .select('*')
            .eq('id', rfqId)
            .single();

        if (rfqError || !rfq) {
            return res.status(404).json({ error: 'RFQ not found' });
        }

        // 2. Fetch RFQ items
        const { data: rfqItems, error: riError } = await supabase
            .from('rfq_items')
            .select('*')
            .eq('rfq_id', rfqId)
            .order('sort_order', { ascending: true });

        if (riError) throw riError;

        // 3. Fetch Quotations (with vendor profile info joined)
        const { data: quotations, error: qError } = await supabase
            .from('quotations')
            .select('*, vendors(id, company_name, rating_avg)')
            .eq('rfq_id', rfqId)
            .in('status', ['submitted', 'under_review', 'selected']);

        if (qError) throw qError;

        // 4. Fetch all Quotation Items for these quotations
        const quotationIds = quotations.map(q => q.id);
        let quotationItems = [];
        if (quotationIds.length > 0) {
            const { data: qiData, error: qiError } = await supabase
                .from('quotation_items')
                .select('*')
                .in('quotation_id', quotationIds);

            if (qiError) throw qiError;
            quotationItems = qiData;
        }

        // 5. Build the matrix in memory
        // Map RFQ Items to rows and append vendor quotes for each item
        const matrix = rfqItems.map(rfqItem => {
            const vendorQuotes = quotations.map(q => {
                // Find matching quote item
                const qItem = quotationItems.find(qi => qi.quotation_id === q.id && qi.rfq_item_id === rfqItem.id);
                return {
                    quotation_id: q.id,
                    vendor_id: q.vendors.id,
                    vendor_name: q.vendors.company_name,
                    unit_price: qItem ? parseFloat(qItem.unit_price) : null,
                    total_price: qItem ? parseFloat(qItem.total_price) : null,
                    tax_rate: qItem ? parseFloat(qItem.tax_rate) : 0,
                    notes: qItem ? qItem.notes : ''
                };
            });

            // Filter out empty quotes, sort by price, and compute price rank
            const validQuotes = vendorQuotes
                .filter(q => q.unit_price !== null)
                .sort((a, b) => a.unit_price - b.unit_price);

            vendorQuotes.forEach(q => {
                if (q.unit_price !== null) {
                    q.price_rank = validQuotes.findIndex(vq => vq.vendor_id === q.vendor_id) + 1;
                } else {
                    q.price_rank = null;
                }
            });

            return {
                rfq_item_id: rfqItem.id,
                item_name: rfqItem.item_name,
                quantity: parseFloat(rfqItem.quantity),
                unit: rfqItem.unit,
                estimated_unit_price: parseFloat(rfqItem.estimated_unit_price),
                quotes: vendorQuotes
            };
        });

        return res.json({
            success: true,
            data: {
                rfq,
                vendors: quotations.map(q => ({
                    quotation_id: q.id,
                    vendor_id: q.vendors.id,
                    company_name: q.vendors.company_name,
                    rating_avg: parseFloat(q.vendors.rating_avg),
                    delivery_days: q.delivery_days,
                    total_amount: parseFloat(q.total_amount),
                    payment_terms: q.payment_terms
                })),
                matrix
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * PUT /api/v1/quotations/:id/select
 * Awards a quotation, transitioning RFQ to 'awarded' and automatically creating a draft Purchase Order.
 */
router.put('/:id/select', requireAuth, requireRole('admin', 'procurement_officer'), async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Fetch quotation to verify
        const { data: quotation, error: qError } = await supabase
            .from('quotations')
            .select('*')
            .eq('id', id)
            .single();

        if (qError || !quotation) {
            return res.status(404).json({ error: 'Quotation not found' });
        }

        if (quotation.status !== 'submitted' && quotation.status !== 'under_review') {
            return res.status(400).json({ error: `Quotation is already in status '${quotation.status}'.` });
        }

        // 2. Fetch RFQ
        const { data: rfq, error: rfqError } = await supabase
            .from('rfqs')
            .select('*')
            .eq('id', quotation.rfq_id)
            .single();

        if (rfqError || !rfq) {
            return res.status(404).json({ error: 'RFQ not found' });
        }

        // Update selected quotation status to selected
        const { data: updatedQuotation } = await supabase
            .from('quotations')
            .update({ status: 'selected', updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        // Update other quotations for this RFQ to rejected
        await supabase
            .from('quotations')
            .update({ status: 'rejected', updated_at: new Date().toISOString() })
            .eq('rfq_id', rfq.id)
            .neq('id', id);

        // Update RFQ status to awarded
        await supabase
            .from('rfqs')
            .update({ status: 'awarded', updated_at: new Date().toISOString() })
            .eq('id', rfq.id);

        // 3. Create Draft Purchase Order (PO)
        const poCountQuery = await supabase.from('purchase_orders').select('id', { count: 'exact', head: true });
        const poSeq = (poCountQuery.count || 0) + 1;
        const poNumber = `PO-2026-${String(poSeq).padStart(4, '0')}`;

        // Standard 18% GST tax calculation for Indian demo context
        const totalAmount = parseFloat(quotation.total_amount);
        const taxAmount = parseFloat((totalAmount * 0.18).toFixed(2));

        const { data: po, error: poError } = await supabase
            .from('purchase_orders')
            .insert({
                po_number: poNumber,
                rfq_id: rfq.id,
                quotation_id: quotation.id,
                vendor_id: quotation.vendor_id,
                status: 'draft',
                total_amount: totalAmount,
                tax_amount: taxAmount,
                payment_terms: quotation.validity_days, // Net payment terms from quotation validity or default
                shipping_address: 'VendorBridge Headquarters, Tower B, 4th Floor, Andheri East, Mumbai - 400069',
                created_by: req.user.id
            })
            .select()
            .single();

        if (poError) throw poError;

        // 4. Fetch quotation items and insert into po_items
        const { data: qItems, error: qiError } = await supabase
            .from('quotation_items')
            .select('*')
            .eq('quotation_id', quotation.id);

        if (qiError) throw qiError;

        const poItemsToInsert = qItems.map(item => ({
            po_id: po.id,
            quotation_item_id: item.id,
            item_name: item.item_name,
            quantity: item.quantity,
            unit: item.unit,
            unit_price: item.unit_price,
            tax_rate: item.tax_rate
        }));

        const { data: poItems, error: poiError } = await supabase
            .from('po_items')
            .insert(poItemsToInsert)
            .select();

        if (poiError) throw poiError;

        return res.json({
            success: true,
            message: 'Quotation selected successfully. Purchase Order generated.',
            data: {
                quotation: updatedQuotation,
                purchase_order: po,
                po_items: poItems
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;
