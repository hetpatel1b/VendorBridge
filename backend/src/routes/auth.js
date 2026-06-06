import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

const router = Router();

/**
 * POST /api/v1/auth/register
 * Registers a new user in Supabase Auth and creates their profile in public.users.
 */
router.post('/register', async (req, res) => {
    const { email, password, first_name, last_name, role, phone } = req.body;

    // Validation
    if (!email || !password || !first_name || !last_name || !role) {
        return res.status(400).json({ error: 'Missing required fields: email, password, first_name, last_name, role' });
    }

    const validRoles = ['admin', 'procurement_officer', 'manager', 'vendor'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ error: `Invalid role. Must be one of: [${validRoles.join(', ')}]` });
    }

    try {
        // 1. Sign up the user in Supabase Auth (this registers the credentials)
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password
        });

        if (authError || !authData.user) {
            return res.status(400).json({ error: authError ? authError.message : 'Failed to register credentials in Supabase Auth' });
        }

        // 2. Synchronize user details with our public.users profile table in database
        // We link it using the same UUID (authData.user.id) as primary key
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email,
                password_hash: 'managed_by_supabase_auth', // Placeholder since password hashing is handled by Supabase
                first_name,
                last_name,
                role,
                phone: phone || null
            })
            .select()
            .single();

        if (profileError) {
            console.error('Error creating public profile for registered user:', profileError);
            return res.status(500).json({
                error: 'Account registered successfully, but database profile creation failed.',
                details: profileError.message
            });
        }

        return res.status(201).json({
            success: true,
            message: 'User account created and database profile synchronized.',
            user: {
                id: authData.user.id,
                email: authData.user.email,
                profile
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/v1/auth/login
 * Signs in user with Supabase Auth and returns their access token JWT + profile.
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Sign in using Supabase Auth client
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error || !data.session) {
            return res.status(401).json({ error: error ? error.message : 'Invalid credentials' });
        }

        // Fetch user profile from the database users table
        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

        return res.json({
            success: true,
            message: 'Authentication successful.',
            token: data.session.access_token, // JWT token to be sent by client in subsequent requests
            user: {
                id: data.user.id,
                email: data.user.email,
                profile: profile || null
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;
