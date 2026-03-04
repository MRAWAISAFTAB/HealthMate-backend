import express from 'express';
import multer from 'multer';
import { uploadAndAnalyzeReport, getUserReports } from '../Controllers/reportController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Memory storage is correct for Gemini/Vercel
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});

// Added 'protect' here - this was the likely cause of the 500 crash
router.post('/upload', protect, upload.single('report'), uploadAndAnalyzeReport);

router.get('/my-history', protect, getUserReports);

export default router;