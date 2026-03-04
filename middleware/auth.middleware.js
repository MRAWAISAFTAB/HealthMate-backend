import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

    if (!token) return res.status(401).json({ message: "Access Denied. Login karo pehle!" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Token se User ID nikal kar request mein daal di
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid Token" });
    }
};