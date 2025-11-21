import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {  // Changed from 'username' to match your form
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: { // Added role field
        type: String,
        enum: ['buyer', 'supplier', 'farmer'], // Only allow these values
        default: 'buyer'
    }
}, { timestamps: true });

export default mongoose.model("User", userSchema);