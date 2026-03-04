import express from 'express';
import multer from 'multer';
import { uploadAndAnalyzeReport } from '../Controllers/reportController.js';
import { getUserReports } from '../Controllers/reportController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Multer Setup: Hum file ko memory mein rakhenge taake seedha Gemini ko bhej sakein
// Isse server par kachra (temp files) jama nahi hoga.
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Max 5MB file limit
});

// Endpoint: POST /api/reports/upload
// 'report' wahi naam hona chahiye jo frontend ke FormData mein hoga.
router.post('/upload', upload.single('report'), uploadAndAnalyzeReport);
router.get('/my-history', protect, getUserReports);

// (Optional) Saari reports fetch karne ka rasta
// router.get('/all/:userId', (req, res) => {
//     res.send("Reports fetching logic goes here...");
// });

export default router;