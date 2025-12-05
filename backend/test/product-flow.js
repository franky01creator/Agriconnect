import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // IMPORT BCRYPT
import app from '../server.js';
import User from '../models/user.js';
import Product from '../models/product.js';

import chai from 'chai';
import chaiHttp from 'chai-http';

chai.use(chaiHttp);
const { expect } = chai;

describe('UAT: Farmer Product Listing & Management Workflow', function () {
    this.timeout(20000); // Increased timeout for cloud DB

    let farmerToken;
    let productId;

    // =================================================================
    // PRE-REQUISITES
    // =================================================================
    before(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }
        
        // 1. Cleanup
        await User.deleteOne({ email: "uat_farmer@test.com" });
        await Product.deleteMany({ productName: "UAT Premium Avocados" });

        // 2. Hash Password Manually
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password123", salt);

        // 3. Create Farmer with HASHED password
        await new User({
            fullName: "UAT Farmer",
            email: "uat_farmer@test.com",
            password: hashedPassword, // <--- FIXED
            role: "farmer"
        }).save();
    });

    after(async () => {
        await User.deleteOne({ email: "uat_farmer@test.com" });
        await Product.deleteMany({ productName: "UAT Premium Avocados" });
    });

    // =================================================================
    // STEP 1: AUTHENTICATION
    // =================================================================
    it('Step 1: Farmer logs into the system', async () => {
        const res = await chai.request(app)
            .post('/api/login')
            .send({ email: "uat_farmer@test.com", password: "password123" });

        // Debug if it fails
        if (res.status !== 200) {
            console.error("Login Failed Response:", res.body);
        }

        expect(res).to.have.status(200);
        expect(res.body).to.have.property('token');
        farmerToken = res.body.token;
    });


    it('Step 2: Farmer lists a new product (Avocados)', async () => {
        const productData = {
            productName: "UAT Premium Avocados",
            category: "Fruits",
            price: 200,
            unit: "kg",
            quantity: 500,
            description: "Freshly picked Hass avocados",
            image: "https://placehold.co/600x400"
        };

        const res = await chai.request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${farmerToken}`)
            .send(productData);

        expect(res).to.have.status(201);
        productId = res.body._id;
    });

    it('Step 3: Verify product appears in the Public Marketplace', async () => {
        const res = await chai.request(app)
            .get('/api/products')
            .set('Authorization', `Bearer ${farmerToken}`);

        expect(res).to.have.status(200);
        const foundProduct = res.body.find(p => p._id === productId);
        expect(foundProduct).to.not.be.undefined;
    });

    // =================================================================
    // STEP 4: INVENTORY MANAGEMENT
    // =================================================================
    it('Step 4: Farmer updates inventory and price', async () => {
        const updateData = { price: 250, quantity: 450 };

        const res = await chai.request(app)
            .put(`/api/products/${productId}`)
            .set('Authorization', `Bearer ${farmerToken}`)
            .send(updateData);

        expect(res).to.have.status(200);
        expect(res.body.price).to.equal(250);
    });

    // =================================================================
    // STEP 5: DELETION
    // =================================================================
    it('Step 5: Farmer removes the listing from the marketplace', async () => {
        const res = await chai.request(app)
            .delete(`/api/products/${productId}`)
            .set('Authorization', `Bearer ${farmerToken}`);

        expect(res).to.have.status(200);
    });
});