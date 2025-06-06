import jwt from 'jsonwebtoken';


export const generateToken = (userId) => {
    // Generate a JWT token with user ID and secret key
    const token = jwt.sign({ userId }, process.env.JWT_SECRET) 
    
    return token
}