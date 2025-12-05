import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    // Link to the Farmer
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', 
    },
    productName: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String, 
        required: true,
    },
    description: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
    },
    unit: {
        type: String, 
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    minOrder: {
        type: Number,
        default: 1, // Set a default of 1 if they don't specify
    },
    harvestDate: {
        type: Date,
    },
    expiryDate: {
        type: Date,
    },
    farmLocation: {
        type: String,
    },
    
    imageUrl: {
        type: String,
        default: '', // Default to empty string so it doesn't crash
    },

    certifications: {
        type: [String],
        default: [],
    }

}, { timestamps: true });

export default mongoose.model('Product', productSchema);