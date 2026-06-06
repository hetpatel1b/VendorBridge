import { supabase } from '../lib/supabase.js';

/**
 * Authentication middleware that verifies the Bearer JWT token
 * against Supabase Auth.
 */
export async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    // Call Supabase Auth to retrieve the user details based on the JWT token
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }

    // Store the authenticated user object in request
    req.user = data.user;
    next();
}

/**
 * Role-based authorization middleware.
 * Fetches the user role from the public.users database profile table.
 * @param {...string} roles allowed roles (e.g. 'admin', 'procurement_officer', 'manager', 'vendor')
 */
export function requireRole(...roles) {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
        }

        try {
            // Retrieve user profile role from our public.users table
            const { data, error } = await supabase
                .from('users')
                .select('role')
                .eq('id', req.user.id)
                .single();

            if (error || !data) {
                return res.status(403).json({ error: 'Forbidden: User profile not found in public database' });
            }

            if (!roles.includes(data.role)) {
                return res.status(403).json({ error: `Forbidden: Insufficient privileges. Required: [${roles.join(', ')}]` });
            }

            // Append role and continue
            req.userProfile = data;
            next();
        } catch (err) {
            return res.status(500).json({ error: 'Internal server error while verifying user role' });
        }
    };
}
