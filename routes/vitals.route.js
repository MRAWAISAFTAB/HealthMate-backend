import express from 'express';
import Vitals from '../models/Vitals.js';
import jwt from 'jsonwebtoken';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

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

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post('/add', protect, async (req, res) => {
    try {
        const { type, value, unit, note } = req.body;
        const newVital = new Vitals({ userId: req.userId, type, value, unit, note });
        await newVital.save();
        res.status(201).json({ message: "Vital record saved!", data: newVital });
    } catch (error) {
        res.status(500).json({ message: "Error saving vital", error: error.message });
    }
});

router.get('/', protect, async (req, res) => {
    try {
        const vitals = await Vitals.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.status(200).json(vitals);
    } catch (error) {
        res.status(500).json({ message: "Error fetching vitals", error: error.message });
    }
});

router.delete('/:id', protect, async (req, res) => {
    try {
        const vital = await Vitals.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!vital) return res.status(404).json({ message: "Record nahi mila!" });
        res.status(200).json({ message: "Deleted!" });
    } catch (error) {
        res.status(500).json({ message: "Delete mein error", error: error.message });
    }
});

router.post('/analyze', protect, async (req, res) => {
    try {
        const vitals = await Vitals.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(20);

        if (vitals.length === 0) {
            return res.status(400).json({ message: "Koi vitals nahi hain analyze karne ke liye!" });
        }

        const vitalsText = vitals.map(v =>
            `${v.type}: ${v.value} ${v.unit} (${new Date(v.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})`
        ).join('\n');

        const prompt = `
You are HealthMate AI. Analyze these patient vitals and return ONLY a valid JSON object with double quotes, no markdown:

PATIENT VITALS:
${vitalsText}

Normal ranges: BP <120/80 mmHg, Fasting Sugar 70-100 mg/dL, Temp 97-99 F

Return ONLY this JSON:
{
  "overallHealth": "Good",
  "summaryEnglish": "2-3 sentence health assessment",
  "summaryUrdu": "2-3 jumlon mein Roman Urdu mein sehat ki wazahat",
  "abnormalValues": ["abnormal vital if any"],
  "doctorQuestions": ["Question 1?", "Question 2?", "Question 3?"],
  "foodsToAvoid": ["Food 1", "Food 2"],
  "recommendedFoods": ["Food 1", "Food 2"],
  "homeRemedies": ["Remedy 1", "Remedy 2"],
  "lifestyle": ["Tip 1", "Tip 2"],
  "disclaimer": "Yeh AI sirf samajhne ke liye hai, ilaaj ke liye nahi. Apne doctor se zaroor milein."
}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });

        let rawText = response.text.trim()
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```\s*$/i, '')
            .trim();

        let parsed;
        try {
            parsed = JSON.parse(rawText);
        } catch (e) {
            parsed = JSON.parse(rawText.replace(/'/g, '"'));
        }

        res.status(200).json({ success: true, report: parsed, vitalsCount: vitals.length });

    } catch (error) {
        console.error("Vitals analyze error:", error);
        res.status(500).json({ message: "Analysis fail ho gaya: " + error.message });
    }
});

export default router;