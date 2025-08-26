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
        const { firstName, lastName, email, phone, currentPassword, newPassword } = req.body;

        // Do not require all profile fields; update only those provided.
        // If this is a password-only request, it will be handled below.

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if email is being changed and if it already exists
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists. Please use a different email.' });
            }
        }

        // Update user fields if provided
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;
        if (phone) user.phone = phone;

        // Handle optional password change in this route
        if (currentPassword || newPassword) {
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ message: 'Both currentPassword and newPassword are required' });
            }

            // Validate new password strength
            const pwErrors = {};
            if (newPassword.length < 8) {
                pwErrors.newPassword = 'Password must be at least 8 characters long';
            } else if (!/(?=.*[a-z])/.test(newPassword)) {
                pwErrors.newPassword = 'Password must contain at least one lowercase letter';
            } else if (!/(?=.*[A-Z])/.test(newPassword)) {
                pwErrors.newPassword = 'Password must contain at least one uppercase letter';
            } else if (!/(?=.*\d)/.test(newPassword)) {
                pwErrors.newPassword = 'Password must contain at least one number';
            } else if (!/(?=.*[@$!%*?&])/.test(newPassword)) {
                pwErrors.newPassword = 'Password must contain at least one special character (@$!%*?&)';
            }
            if (Object.keys(pwErrors).length > 0) {
                return res.status(400).json({ message: 'Validation failed', errors: pwErrors });
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ 
                    message: 'Invalid current password',
                    errors: { currentPassword: 'Current password is incorrect' }
                });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
        }

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

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validate inputs
        const errors = {};
        if (!currentPassword) {
            errors.currentPassword = 'Current password is required';
        }
        if (!newPassword) {
            errors.newPassword = 'New password is required';
        } else if (newPassword.length < 8) {
            errors.newPassword = 'Password must be at least 8 characters long';
        } else if (!/(?=.*[a-z])/.test(newPassword)) {
            errors.newPassword = 'Password must contain at least one lowercase letter';
        } else if (!/(?=.*[A-Z])/.test(newPassword)) {
            errors.newPassword = 'Password must contain at least one uppercase letter';
        } else if (!/(?=.*\d)/.test(newPassword)) {
            errors.newPassword = 'Password must contain at least one number';
        } else if (!/(?=.*[@$!%*?&])/.test(newPassword)) {
            errors.newPassword = 'Password must contain at least one special character (@$!%*?&)';
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ message: 'Validation failed', errors });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                message: 'Invalid current password',
                errors: { currentPassword: 'Current password is incorrect' }
            });
        }

        // Update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
