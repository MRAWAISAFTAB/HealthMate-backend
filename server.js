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

// 1. Optimized CORS for Mobile & Vercel
// Using a specific origin is better for iOS "strict-origin" policies
app.use(cors({
    origin: process.env.CLIENT_URL, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200 
}));

// 2. Body Parsers (iOS often sends larger image/PDF health reports)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Database Connection Logic (Serverless optimized)
const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return; // Use existing connection
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB Atlas");
    } catch (err) {
        console.error("❌ Database connection error:", err.message);
    }
};

// Middleware to ensure DB is connected before handling requests
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// 4. Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/vitals', vitalRoutes);

// Health check
app.get('/check', (req, res) => {
    res.status(200).json({ status: 'online', message: '✅ HealthMate server is running!' });
});

// 5. Global Error Handler (Crucial for clean Mobile UI alerts)
app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({
        error: true,
        message: err.message || "An unexpected error occurred",
    });
});

// 6. Execution Logic
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`📱 Local Server: http://localhost:${PORT}`);
    });
}

export default app;