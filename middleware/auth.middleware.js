import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Login karo pehle! (Token missing)" });
        }

        const token = authHeader.split(' ')[1];
        
        // Use the same secret/fallback as your auth routes
        const secret = process.env.JWT_SECRET || 'secret_vibe';
        const verified = jwt.verify(token, secret);

        // This creates req.user.id (from your login/signup sign logic)
        req.user = verified; 
        next();
    } catch (err) {
        console.error("Auth Middleware Error:", err.message);
        return res.status(401).json({ message: "Session expired or invalid token" });
    }
};