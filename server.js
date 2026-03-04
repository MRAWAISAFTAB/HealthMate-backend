import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';

// Routes Imports
import authRoutes from './routes/auth.route.js'; // 👈 YE ADD KIYA
import reportRoutes from './routes/reportRoutes.js'; 
import vitalRoutes from './routes/vitals.route.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ✅ Auth Route register karna lazmi hai
app.use('/api/auth', authRoutes); 

app.use('/api/reports', reportRoutes);
app.use('/api/vitals', vitalRoutes);


app.get('/check' , (req,res)=>{
    res.ssend('Hello on /check')
  console.log("hello world running");
})

// Database Connection & Server Start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("✅ Connected to MongoDB Atlas");
        app.listen(PORT, () => {
            console.log(`📱 Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Database connection error:", err.message);
    });