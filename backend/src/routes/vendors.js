import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/v1/vendors
 * Lists all vendors with support for search, category/status filtering, and pagination.
 */
router.get('/', requireAuth, async (req, res) => {
    const { category, status, search, page = 1, limit = 10 } = req.query;
    const from = (page - 1) * limit;
    const to = from + parseInt(limit) - 1;

    try {
        let query = supabase
            .from('vendors')
            .select('*', { count: 'exact' });

        if (category) {
            query = query.eq('category', category);
        }

        if (status) {
            query = query.eq('status', status);
        }

        if (search) {
            query = query.ilike('company_name', `%${search}%`);
        }

        const { data: vendors, error, count } = await query
            .order('rating_avg', { ascending: false })
            .range(from, to);

        if (error) throw error;

        return res.json({
            success: true,
            data: vendors,
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
 * GET /api/v1/vendors/:id
 * Fetches vendor details along with their rating scorecard (aggregates and history).
 */
router.get('/:id', requireAuth, async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Fetch vendor profile
        const { data: vendor, error: vendorError } = await supabase
            .from('vendors')
            .select('*')
            .eq('id', id)
            .single();

        if (vendorError || !vendor) {
            return res.status(404).json({ error: 'Vendor not found' });
        }

        // 2. Fetch rating history for detailed scorecard calculations
        const { data: ratings, error: ratingsError } = await supabase
            .from('vendor_ratings')
            .select('*')
            .eq('vendor_id', id);

        if (ratingsError) throw ratingsError;

        // Calculate average sub-scores in real-time
        const scorecard = {
            avg_quality: 0.00,
            avg_delivery: 0.00,
            avg_price: 0.00,
            avg_response: 0.00,
            overall_score: parseFloat(vendor.rating_avg) || 0.00,
            total_ratings: ratings.length
        };

        if (ratings.length > 0) {
            const sum = ratings.reduce((acc, curr) => {
                acc.quality += parseFloat(curr.quality_score);
                acc.delivery += parseFloat(curr.delivery_score);
                acc.price += parseFloat(curr.price_score);
                acc.response += parseFloat(curr.response_score);
                return acc;
            }, { quality: 0, delivery: 0, price: 0, response: 0 });

            scorecard.avg_quality = parseFloat((sum.quality / ratings.length).toFixed(2));
            scorecard.avg_delivery = parseFloat((sum.delivery / ratings.length).toFixed(2));
            scorecard.avg_price = parseFloat((sum.price / ratings.length).toFixed(2));
            scorecard.avg_response = parseFloat((sum.response / ratings.length).toFixed(2));
        }

        return res.json({
            success: true,
            data: {
                ...vendor,
                scorecard,
                ratings_history: ratings
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * PUT /api/v1/vendors/:id/status
 * Approves, suspends, or blacklists a vendor. Restricted to Admins.
 */
router.put('/:id/status', requireAuth, requireRole('admin'), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'approved', 'suspended', 'blacklisted'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: [${validStatuses.join(', ')}]` });
    }

    try {
        const { data: vendor, error } = await supabase
            .from('vendors')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error || !vendor) {
            return res.status(404).json({ error: 'Vendor profile not found or update failed' });
        }

        return res.json({
            success: true,
            message: `Vendor status successfully updated to '${status}'.`,
            data: vendor
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;
