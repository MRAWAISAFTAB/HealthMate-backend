import express from 'express';
import multer from 'multer';
import { uploadAndAnalyzeReport, getUserReports, deleteReport } from '../Controllers/reportController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/upload', protect, upload.single('report'), uploadAndAnalyzeReport);
router.get('/my-history', protect, getUserReports);
router.delete('/:id', protect, deleteReport);

export default router;