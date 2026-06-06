import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import vendorRoutes from './routes/vendors.js';
import rfqRoutes from './routes/rfqs.js';
import quotationRoutes from './routes/quotations.js';
import dbProxy from './routes/dbProxy.js';
import { requireAuth } from './middleware/auth.js';

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// Welcome endpoint at root
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the VendorBridge ERP Backend API!',
        status: 'UP',
        documentation: 'Use the endpoints listed below to interact with the API.',
        endpoints: {
            auth: {
                register: 'POST /api/v1/auth/register',
                login: 'POST /api/v1/auth/login'
            },
            profile: 'GET /api/v1/profile (Requires Token)',
            vendors: {
                list: 'GET /api/v1/vendors (Requires Token)',
                detail: 'GET /api/v1/vendors/:id (Requires Token)',
                updateStatus: 'PUT /api/v1/vendors/:id/status (Requires Admin)'
            },
            rfqs: {
                list: 'GET /api/v1/rfqs (Requires Token — Vendors only see invitations)',
                detail: 'GET /api/v1/rfqs/:id (Requires Token)',
                create: 'POST /api/v1/rfqs (Requires Procurement Officer)',
                send: 'PUT /api/v1/rfqs/:id/send (Requires Procurement Officer)',
                close: 'PUT /api/v1/rfqs/:id/close (Requires Procurement Officer)'
            },
            quotations: {
                submit: 'POST /api/v1/quotations (Requires Vendor)',
                listByRfq: 'GET /api/v1/quotations/rfq/:rfqId (Requires Token)',
                compare: 'GET /api/v1/quotations/compare/:rfqId (Requires Token — Star Comparison Engine)',
                select: 'PUT /api/v1/quotations/:id/select (Requires Procurement Officer — Generates PO)'
            },
            health: 'GET /health'
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'VendorBridge ERP Service'
    });
});

// Register routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/rfqs', rfqRoutes);
app.use('/api/v1/quotations', quotationRoutes);
app.use('/api/v1/db', dbProxy);

// Endpoint: GET /api/v1/profile (Protected, accessible by any user role)
app.get('/api/v1/profile', requireAuth, (req, res) => {
    res.json({
        message: 'Successfully retrieved auth user details.',
        user: req.user
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
