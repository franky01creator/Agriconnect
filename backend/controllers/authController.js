import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    try {
        // 1. Destructure the new fields from the request body
        const { fullName, email, password, role } = req.body;

        // 2. Validation
        if (!fullName || !email || !password || !role) {
             return res.status(400).json({ message: "All fields are required" });
        }

        // 3. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 4. Hash password
        const salt = await bcrypt.genSalt(8);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 5. Create user with new fields
        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            role
        });

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Server error during registration" });
    }
};

// ... keep loginUser as it was ...


export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2. Check if user is a Google OAuth user (no password)
        if (user.googleId && !user.password) {
            return res.status(400).json({ 
                message: "This account was created with Google. Please use Google Sign-In." 
            });
        }

        // 3. Check if password exists
        if (!user.password) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 4. Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 5. Generate JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error during login" });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    // req.user is set by the protect middleware
    const user = {
        _id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        role: req.user.role,
        profilePicture: req.user.profilePicture || ''
    };

    res.status(200).json(user);
};

// @desc    Google OAuth - Initiate authentication
// @route   GET /api/auth/google
// @access  Public
export const googleAuth = (req, res, next) => {
    // This will be handled by passport middleware
    // Just pass to next middleware
    next();
};

// @desc    Google OAuth - Handle callback and generate JWT
// @route   GET /api/auth/google/callback
// @access  Public
export const googleCallback = async (req, res) => {
    try {
        const user = req.user; // Set by passport after successful authentication

        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5001'}/login.html?error=authentication_failed`);
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        // Redirect to frontend with token in URL (frontend will handle storing it)
        const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5001'}/auth-callback.html?token=${token}&user=${encodeURIComponent(JSON.stringify({
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role
        }))}`;

        res.redirect(redirectUrl);
    } catch (error) {
        console.error("Google Callback Error:", error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5001'}/login.html?error=server_error`);
    }
};