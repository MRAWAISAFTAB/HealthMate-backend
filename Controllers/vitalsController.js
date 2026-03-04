import Vitals from '../models/Vitals.js';

export const addVitals = async (req, res) => {
    try {
        const { userId, bp, sugar, weight, notes } = req.body;

        const newEntry = new Vitals({ userId, bp, sugar, weight, notes });
        await newEntry.save();

        res.status(201).json({ message: "Vitals saved! 🩺", data: newEntry });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};