import express from 'express';
import Vitals from '../models/Vitals.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Auth middleware
const protect = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: "Token nahi mila!" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};

// POST /api/vitals/add
router.post('/add', protect, async (req, res) => {
    try {
        const { type, value, unit, note } = req.body;
        const newVital = new Vitals({ userId: req.userId, type, value, unit, note });
        await newVital.save();
        res.status(201).json({ message: "Vital record saved! ❤️", data: newVital });
    } catch (error) {
        res.status(500).json({ message: "Error saving vital", error: error.message });
    }
});

// GET /api/vitals
router.get('/', protect, async (req, res) => {
    try {
        const vitals = await Vitals.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.status(200).json(vitals);
    } catch (error) {
        res.status(500).json({ message: "Error fetching vitals", error: error.message });
    }
});

// DELETE /api/vitals/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        const vital = await Vitals.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!vital) return res.status(404).json({ message: "Record nahi mila ya permission nahi!" });
        res.status(200).json({ message: "Deleted! ✅" });
    } catch (error) {
        res.status(500).json({ message: "Delete mein error", error: error.message });
    }
});

export default router;