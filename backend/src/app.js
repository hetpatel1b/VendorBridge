import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import { requireAuth, requireRole } from './middleware/auth.js';

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'VendorBridge ERP Auth Service'
    });
});

// Register auth routes
app.use('/api/v1/auth', authRoutes);

// ==========================================
// DEMONSTRATION ROUTES (PROTECTED BY AUTH & RBAC)
// ==========================================

// Endpoint: GET /api/v1/profile (Protected, accessible by any user role)
app.get('/api/v1/profile', requireAuth, (req, res) => {
    res.json({
        message: 'Successfully retrieved auth user details.',
        user: req.user
    });
});

// Endpoint: GET /api/v1/rfqs (Protected, only 'admin' or 'procurement_officer' can read RFQs)
app.get('/api/v1/rfqs', requireAuth, requireRole('admin', 'procurement_officer'), (req, res) => {
    res.json({
        message: 'Authorized to view RFQs.',
        userProfile: req.userProfile,
        rfqs: [
            { id: 1, title: 'Laptop Procurement', category: 'IT', status: 'open' }
        ]
    });
});

// Endpoint: POST /api/v1/rfqs (Protected, only 'procurement_officer' can create RFQs)
app.post('/api/v1/rfqs', requireAuth, requireRole('procurement_officer'), (req, res) => {
    res.status(201).json({
        message: 'Authorized to create RFQ.',
        userProfile: req.userProfile,
        createdRfq: req.body
    });
});

// Route Not Found Handler
app.use((req, res, next) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

export default app;
