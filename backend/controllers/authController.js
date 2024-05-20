const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists'});
        }

        const hashedPassword = await password;

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });
        await newUser.save();

        res.status(201).json({ message: 'User registered succesfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error registering user'});
    }
};

exports.loginUser = async (req, res) => {
    const { email, password} = req.body;
    try{
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(404).json({ error: 'User not found'});
        }

        const passwordMatch = await user.password;
        if(!passwordMatch) {
            return res.status(401).json({ error: 'Incorrect passeord'});
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h'});

        res.status(200).json({ token});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error logging in'});
    }
};

exports.logoutUser = async (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).json({ message: 'User logged out successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error logging out'});
    }
};