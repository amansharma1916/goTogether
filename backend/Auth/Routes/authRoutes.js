import express from 'express';
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
        res.status(201).json({ message: 'User registered successfully' });
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
        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/test', (req, res) => {
    res.send('Auth route is working!');
});


export default router;