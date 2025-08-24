const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;

        // Enhanced validation
        const errors = {};

        // First Name validation
        if (!firstName || !firstName.trim()) {
            errors.firstName = 'First name is required';
        } else if (firstName.trim().length < 2) {
            errors.firstName = 'First name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(firstName.trim())) {
            errors.firstName = 'First name can only contain letters and spaces';
        }

        // Last Name validation
        if (!lastName || !lastName.trim()) {
            errors.lastName = 'Last name is required';
        } else if (lastName.trim().length < 2) {
            errors.lastName = 'Last name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(lastName.trim())) {
            errors.lastName = 'Last name can only contain letters and spaces';
        }

        // Email validation
        if (!email || !email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            errors.email = 'Please enter a valid email address';
        }

        // Phone validation
        if (!phone || !phone.trim()) {
            errors.phone = 'Phone number is required';
        } else {
            const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
            if (cleanPhone.length < 10) {
                errors.phone = 'Phone number must be at least 10 digits';
            } else if (!/^[\+]?[1-9][\d]{9,15}$/.test(cleanPhone)) {
                errors.phone = 'Please enter a valid phone number (minimum 10 digits)';
            }
        }

        // Password validation
        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 8) {
            errors.password = 'Password must be at least 8 characters long';
        } else if (!/(?=.*[a-z])/.test(password)) {
            errors.password = 'Password must contain at least one lowercase letter';
        } else if (!/(?=.*[A-Z])/.test(password)) {
            errors.password = 'Password must contain at least one uppercase letter';
        } else if (!/(?=.*\d)/.test(password)) {
            errors.password = 'Password must contain at least one number';
        } else if (!/(?=.*[@$!%*?&])/.test(password)) {
            errors.password = 'Password must contain at least one special character (@$!%*?&)';
        }

        // Return validation errors if any
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ 
                message: 'Validation failed',
                errors 
            });
        }

        // Check if user already exists (case-insensitive)
        const existingUser = await User.findOne({ 
            email: { $regex: new RegExp(`^${email.trim()}$`, 'i') }
        });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'User already exists',
                errors: { email: 'Email already exists. Please use a different email.' }
            });
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ 
            firstName, 
            lastName, 
            email, 
            phone, 
            password: hashedPassword, 
            role: 'buyer'
        });
        await user.save();

        res.status(201).json({ 
            message: 'User registered successfully',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Enhanced validation
        const errors = {};

        // Email validation
        if (!email || !email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            errors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!password) {
            errors.password = 'Password is required';
        }

        // Return validation errors if any
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ 
                message: 'Validation failed',
                errors 
            });
        }

        // Find user and check password
        const user = await User.findOne({ email: email.trim() });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Create token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ 
            token, 
            user: { 
                id: user._id, 
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email, 
                phone: user.phone,
                role: user.role 
            } 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET PROFILE
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, email, phone } = req.body;

        if (!firstName || !lastName || !email || !phone) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if email is being changed and if it already exists
        if (email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists. Please use a different email.' });
            }
        }

        // Update user fields
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.phone = phone;

        await user.save();

        res.json({ 
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
