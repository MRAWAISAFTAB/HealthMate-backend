import User from '../../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 1. REGISTER (Signup)
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check agar user pehle se hai
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User pehle se bana hua hai!" });

        // Password ko hash (hide) karna
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: "Account ban gaya! Ab login karein." });

    } catch (error) {
        res.status(500).json({ message: "Registration mein error", error: error.message });
    }
};

// 2. LOGIN
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // User dhoondo
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User nahi mila!" });

        // Password check karo
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: "Ghalat password!" });

        // Token generate karo (7 din ke liye)
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: "Login successful! ❤️",
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });

    } catch (error) {
        res.status(500).json({ message: "Login mein error", error: error.message });
    }
};