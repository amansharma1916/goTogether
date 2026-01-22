import express from 'express';
import mongoose from 'mongoose';
import Registration from '../../DB/Schema/registrationSchema.js';
import bcrypt from 'bcryptjs';
const router = express.Router();

router.post('/register', async (req, res) => {
    const { fullname, email, password, college } = req.body;
    try {
        const userExists = await Registration.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const newUser = new Registration({
            fullname,
            email,
            password,
            college
        });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server error' ,error: error.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Registration.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        res.status(200).json({ message: 'Login successful', user, success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
        
    }
});

router.get('/test', (req, res) => {
    res.send('Auth route is working!');
});

// Update user profile
router.put('/update-profile/:id', async (req, res) => {
    const { id } = req.params;
    const { fullname, email, college } = req.body;
    
    try {
        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID', success: false });
        }

        // Check if email is being changed and if it already exists
        if (email) {
            const existingUser = await Registration.findOne({ email, _id: { $ne: id } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use', success: false });
            }
        }

        // Update user profile
        const updatedUser = await Registration.findByIdAndUpdate(
            id,
            {
                ...(fullname && { fullname }),
                ...(email && { email }),
                ...(college !== undefined && { college })
            },
            { new: true, runValidators: true }
        ).select('-password'); // Exclude password from response

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        res.status(200).json({ 
            message: 'Profile updated successfully', 
            user: updatedUser,
            success: true 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message, success: false });
    }
});

export default router;