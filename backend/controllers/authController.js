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
        const salt = await bcrypt.genSalt(10);
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

        // 2. Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 3. Generate JWT Token
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
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        farmLocation: req.user.farmLocation,
        role: req.user.role
    };

    res.status(200).json(user);
};