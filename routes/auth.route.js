import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// 1. Signup Route
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation check
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Bhai, details puri bharien!" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // Agar user save ho chuka hai, toh 400 ke bajaye hum check karte hain
            return res.status(400).json({ message: "Email already exists! Please login." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        
        // Save user
        await user.save();

        // Token generation
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'secret_vibe', // Fallback agar env miss ho
            { expiresIn: '7d' }
        );

        // Success response
        return res.status(201).json({ 
            message: "User created!",
            token, 
            user: { id: user._id, name: user.name, email: user.email } 
        });

    } catch (error) {
        console.error("Signup Backend Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// 2. Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Details missing!" });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "User not found!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Wrong credentials!" });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'secret_vibe',
            { expiresIn: '7d' }
        );

        return res.json({ 
            token, 
            user: { id: user._id, name: user.name, email: user.email } 
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

export default router;