import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {  
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
        required: function() {
            return !this.googleId; // Password required only if not using Google OAuth
        },
        minlength: 6
    },
    googleId: {
        type: String,
        sparse: true, 
        unique: true
    },
    profilePicture: {
        type: String,
        default: ''
    },
    role: { // Added role field
        type: String,
        enum: ['buyer', 'supplier', 'farmer'], // Only allow these values
        default: 'buyer'
    }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", userSchema);