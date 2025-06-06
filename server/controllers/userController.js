import cloudinary from '../lib/cloudinary.js';
import { generateToken } from '../lib/utils.js';
import UserDb from '../models/User.js'
import bcrypt from 'bcryptjs'

export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;
    
    try {
        // Check if all fields are provided
        if( !fullName || !email || !password || !bio) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Check if user already exists
        const existingUser = await UserDb.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await UserDb.create({
            fullName,
            email,
            password: hashedPassword,
            bio
        });

        // generate token
        const token = generateToken(newUser._id);

        res.status(201).json({
            success: true,
            userData: newUser,
            token: token, 
            message: 'Account created successfully.'
        })
    } 
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if all fields are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Find user by email
        const user = await UserDb.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid Email.' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid Password.' });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            userData: user,
            token: token,
            message: 'Login successful.'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// controller to check if user is authenticated
export const checkAuth = (req, res) => {
    res.json({
        success: true,
        user: req.user,
        message: 'User is authenticated.'
    });
}

// controller to update user profile
export const updateProfile = async (req, res) => {
    try {
        const { fullName, profilePic, bio } = req.body;

        const userId = req.user._id
        let updateUser;
        // Check if profilePic is provided
        if (profilePic) {
            // Upload image to Cloudinary
            const uploadResult = await cloudinary.uploader.upload(profilePic);

            updateUser = await UserDb.findByIdAndUpdate(
                userId,
                { fullName, profilePic: uploadResult.secure_url, bio },
                { new: true }
            );
        } else {
            updateUser = await UserDb.findByIdAndUpdate(
                userId,
                { fullName, bio },
                { new: true }
            );
        }

        res.json({
            success: true,
            user: updateUser,
            message: 'Profile updated successfully.'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};