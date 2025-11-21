import express from "express";
import { registerUser, loginUser, getUserProfile } from "../controllers/authController.js";
import { createProduct, getMyListings, getAllProducts, updateProduct, deleteProduct } from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get('/profile', protect, getUserProfile);

router.post('/products', protect, createProduct);
router.get('/products/my-listings', protect, getMyListings);
router.get('/products', protect, getAllProducts);
router.put('/products/:id', protect, updateProduct);
router.delete('/products/:id', protect, deleteProduct);


// router.get("/", (req,res) => { 
//     res.status(200).send("post created sucessfully");
// });





export default router;



// app.post("/", (req,res) => { 
//     res.status(200).send("post created sucessfully");
// });


// app.get("/", (req,res) => { 
//     res.status(200).send("products");
// });

// app.put("/:id", (req,res) => { 
//     res.status(200).send("post updated sucessfully");
// });

// app.put("/:id", (req,res) => { 
//     res.status(200).send("post deleted sucessfully");
// });