import Product from '../models/product.js';

// @desc    Create a new product
// @route   POST /api/products

export const createProduct = async (req, res) => {
    try {
        const {
            productName,
            category,
            description,
            price,
            unit,
            quantity,
            minOrder,
            harvestDate,
            expiryDate,
            imageUrl,       
            certifications, 
            farmLocation    
        } = req.body;

        // req.user is added by the authMiddleware
        const farmerId = req.user._id; 
        
        // Logic: Use location from form, fallback to user profile, fallback to default
        const finalLocation = farmLocation || req.user.farmLocation || "Farmer's Location"; 

        const product = new Product({
            farmer: farmerId,
            productName,
            category,
            description,
            price,
            unit,
            quantity,
            minOrder,
            harvestDate,
            expiryDate,
            farmLocation: finalLocation,
            imageUrl,       // <--- Save to DB
            certifications  // <--- Save to DB
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Server error creating product' });
    }
};

// @desc    Get products listed by the logged-in farmer
// @route   GET /api/products/my-listings

export const getMyListings = async (req, res) => {
    try {
        // Find listings and SORT by newest first (createdAt: -1)
        const products = await Product.find({ farmer: req.user._id })
                                      .sort({ createdAt: -1 }); 
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ message: 'Server error fetching listings' });
    }
};

// @desc    Get all products for the Marketplace
// @route   GET /api/products

export const getAllProducts = async (req, res) => {
    try {
        // 1. Find all products
        // 2. Populate 'farmer' name (needed for the card display)
        // 3. Sort by newest first
        const products = await Product.find({})
                                      .populate('farmer', 'fullName')
                                      .sort({ createdAt: -1 });
        
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching all products:', error);
        res.status(500).json({ message: 'Server error fetching products' });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id

export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if the product belongs to the logged-in user
        if (product.farmer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this product' });
        }

        // Update fields
        const {
            productName,
            category,
            description,
            price,
            unit,
            quantity,
            minOrder,
            harvestDate,
            expiryDate,
            imageUrl,
            certifications,
            farmLocation
        } = req.body;

        if (productName) product.productName = productName;
        if (category) product.category = category;
        if (description !== undefined) product.description = description;
        if (price !== undefined) product.price = price;
        if (unit) product.unit = unit;
        if (quantity !== undefined) product.quantity = quantity;
        if (minOrder !== undefined) product.minOrder = minOrder;
        if (harvestDate !== undefined) product.harvestDate = harvestDate;
        if (expiryDate !== undefined) product.expiryDate = expiryDate;
        if (imageUrl !== undefined) product.imageUrl = imageUrl;
        if (certifications !== undefined) product.certifications = certifications;
        if (farmLocation !== undefined) product.farmLocation = farmLocation;

        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Server error updating product' });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Owner only)
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if the product belongs to the logged-in user
        if (product.farmer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this product' });
        }

        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Server error deleting product' });
    }
};