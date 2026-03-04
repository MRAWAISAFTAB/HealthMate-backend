import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';

// Routes Imports
import authRoutes from './routes/auth.route.js';
import reportRoutes from './routes/reportRoutes.js';
import vitalRoutes from './routes/vitals.route.js';

dotenv.config();
const app = express();

// Updated CORS configuration for Vercel compatibility
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Added OPTIONS for preflight
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200 // Fixed: Essential for some browsers/proxies
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/vitals', vitalRoutes);

// Health check — typo fix (ssend -> send)
app.get('/check', (req, res) => {
    res.send('✅ HealthMate server is running!');
});

// Database Connection & Server Start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("✅ Connected to MongoDB Atlas");
        // Check if we are not in a serverless environment (like Vercel) to listen
        if (process.env.NODE_ENV !== 'production') {
            app.listen(PORT, () => {
                console.log(`📱 Server running on http://localhost:${PORT}`);
            });
        }
    })
    .catch((err) => {
        console.error("❌ Database connection error:", err.message);
    });

export default app; // Export for Vercel's serverless functions