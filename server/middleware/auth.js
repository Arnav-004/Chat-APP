import jwt from 'jsonwebtoken';
import UserDb from '../models/User.js';

export const authenticateUser = async (req, res, next) => {
    try{
        const token = req.headers.token;
        
        if (!token) return res.status(401).json({ message: 'Token missing' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (!decoded) return res.status(403).json({ message: 'Invalid token' });

        // Check if user exists in the database and attach user info to request object
        const user = await UserDb.findById(decoded.userId).select("-password"); 
        
        if(!user) return res.status(404).json({ message: 'User not found' });
        req.user = user;
        next()
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
    
};