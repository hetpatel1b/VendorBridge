import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/v1/rfqs
 * Lists RFQs. Role-aware: vendors only see RFQs they are invited to.
 */
router.get('/', requireAuth, async (req, res) => {
    const { status, category, page = 1, limit = 10 } = req.query;
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;

    try {
        // Fetch user profile to check role
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', req.user.id)
            .single();

        let query = supabase
            .from('rfqs')
            .select('*', { count: 'exact' });

        // Vendor role restriction
        if (profile && profile.role === 'vendor') {
            // Find corresponding vendor record
            const { data: vendor, error: vError } = await supabase
                .from('vendors')
                .select('id')
                .eq('user_id', req.user.id)
                .single();

            if (vError || !vendor) {
                return res.json({
                    success: true,
                    data: [],
                    meta: { page: 1, limit: 10, total: 0 }
                });
            }

            // Find RFQs this vendor is invited to
            const { data: invitedRfqs, error: inviteError } = await supabase
                .from('rfq_vendors')
                .select('rfq_id')
                .eq('vendor_id', vendor.id);

            if (inviteError) throw inviteError;

            const rfqIds = invitedRfqs.map(item => item.rfq_id);
            if (rfqIds.length === 0) {
                return res.json({
                    success: true,
                    data: [],
                    meta: { page: 1, limit: 10, total: 0 }
                });
            }

            query = query.in('id', rfqIds);
        }

        // Apply filters
        if (status) query = query.eq('status', status);
        if (category) query = query.eq('category', category);

        const { data: rfqs, error, count } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        return res.json({
            success: true,
            data: rfqs,
            meta: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/v1/rfqs/:id
 * Fetches RFQ details including line items and invited vendors.
 */
router.get('/:id', requireAuth, async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Fetch RFQ header
        const { data: rfq, error: rfqError } = await supabase
            .from('rfqs')
            .select('*')
            .eq('id', id)
            .single();

        if (rfqError || !rfq) {
            return res.status(404).json({ error: 'RFQ not found' });
        }

        // 2. Fetch line items
        const { data: items, error: itemsError } = await supabase
            .from('rfq_items')
            .select('*')
            .eq('rfq_id', id)
            .order('sort_order', { ascending: true });

        if (itemsError) throw itemsError;

        // 3. Fetch invited vendors details (only for procurement/admin)
        let invitedVendors = [];
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', req.user.id)
            .single();

        if (profile && profile.role !== 'vendor') {
            const { data: invites, error: inviteError } = await supabase
                .from('rfq_vendors')
                .select('vendor_id, invited_at, viewed_at, responded, vendors(company_name, email, rating_avg)')
                .eq('rfq_id', id);

            if (inviteError) throw inviteError;
            invitedVendors = invites;
        }

        return res.json({
            success: true,
            data: {
                ...rfq,
                items,
                invited_vendors: invitedVendors
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/v1/rfqs
 * Creates a new RFQ along with items and vendor invitations.
 */
router.post('/', requireAuth, requireRole('admin', 'procurement_officer'), async (req, res) => {
    const { title, description, category, priority, submission_deadline, budget_estimate, items, vendor_ids } = req.body;

    if (!title || !category || !submission_deadline || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Missing required fields: title, category, submission_deadline, items[]' });
    }

    try {
        // Generate sequential RFQ number
        const countQuery = await supabase.from('rfqs').select('id', { count: 'exact', head: true });
        const seq = (countQuery.count || 0) + 1;
        const rfqNumber = `RFQ-2026-${String(seq).padStart(4, '0')}`;

        // 1. Insert RFQ header
        const { data: rfq, error: rfqError } = await supabase
            .from('rfqs')
            .insert({
                rfq_number: rfqNumber,
                title,
                description,
                category,
                priority: priority || 'medium',
                submission_deadline,
                budget_estimate,
                created_by: req.user.id,
                status: 'draft'
            })
            .select()
            .single();

        if (rfqError) throw rfqError;

        // 2. Insert line items
        const itemsToInsert = items.map((item, index) => ({
            rfq_id: rfq.id,
            item_name: item.item_name,
            description: item.description || null,
            quantity: item.quantity,
            unit: item.unit || 'pcs',
            estimated_unit_price: item.estimated_unit_price || null,
            sort_order: index + 1
        }));

        const { data: insertedItems, error: itemsError } = await supabase
            .from('rfq_items')
            .insert(itemsToInsert)
            .select();

        if (itemsError) throw itemsError;

        // 3. Invite vendors
        let invited = [];
        if (vendor_ids && Array.isArray(vendor_ids) && vendor_ids.length > 0) {
            const vendorInvites = vendor_ids.map(vId => ({
                rfq_id: rfq.id,
                vendor_id: vId,
                responded: false
            }));

            const { data: insertedInvites, error: inviteError } = await supabase
                .from('rfq_vendors')
                .insert(vendorInvites)
                .select();

            if (inviteError) throw inviteError;
            invited = insertedInvites;
        }

        return res.status(201).json({
            success: true,
            message: 'RFQ created successfully in draft mode.',
            data: {
                ...rfq,
                items: insertedItems,
                invited_vendors: invited
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * PUT /api/v1/rfqs/:id/send
 * Transition RFQ status to 'open' to invite vendor bidding.
 */
router.put('/:id/send', requireAuth, requireRole('admin', 'procurement_officer'), async (req, res) => {
    const { id } = req.params;

    try {
        const { data: rfq, error } = await supabase
            .from('rfqs')
            .update({ status: 'open', updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error || !rfq) {
            return res.status(404).json({ error: 'RFQ not found or update failed' });
        }

        return res.json({
            success: true,
            message: 'RFQ status updated to open. Vendors can now submit quotations.',
            data: rfq
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * PUT /api/v1/rfqs/:id/close
 * Close RFQ for vendor bidding manually.
 */
router.put('/:id/close', requireAuth, requireRole('admin', 'procurement_officer'), async (req, res) => {
    const { id } = req.params;

    try {
        const { data: rfq, error } = await supabase
            .from('rfqs')
            .update({
                status: 'closed',
                closed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error || !rfq) {
            return res.status(404).json({ error: 'RFQ not found or update failed' });
        }

        return res.json({
            success: true,
            message: 'RFQ bidding successfully closed.',
            data: rfq
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;
