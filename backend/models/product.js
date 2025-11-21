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
        type: String, // 'fresh-produce', 'vegetables', etc.
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
        type: String, // 'kg', 'piece', 'bushel'
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
    
    // --- NEW ADDITIONS ---
    
    // 1. Image URL
    // Even if you aren't doing complex file uploads yet, you need a place
    // to store the path/URL so the Marketplace can display it.
    imageUrl: {
        type: String,
        default: '', // Default to empty string so it doesn't crash
    },

    // 2. Certifications
    // Your form has checkboxes. An Array of Strings is the best way to store them.
    // Example: ['Organic', 'Local']
    certifications: {
        type: [String],
        default: [],
    }

}, { timestamps: true });

export default mongoose.model('Product', productSchema);