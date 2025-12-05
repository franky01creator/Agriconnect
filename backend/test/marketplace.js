import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; 
import app from '../server.js';
import User from '../models/user.js';
import Product from '../models/product.js';

import chai from 'chai';
import chaiHttp from 'chai-http';

chai.use(chaiHttp);
const { expect } = chai;

describe('UAT: Marketplace Discovery & Buyer Workflow', function () {
    this.timeout(20000); 

    let buyerToken;
    let tomatoId, mangoId;

    // =================================================================
    // PRE-REQUISITES
    // =================================================================
    before(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }

        // 1. Clean Database
        await User.deleteMany({ email: { $in: ["uat_buyer@test.com", "uat_supplier@test.com"] } });
        await Product.deleteMany({ productName: { $in: ["Fresh Red Tomatoes", "Sweet Mangoes", "Kales"] } });

        // 2. Create Users
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password123", salt);

        const farmer = await new User({
            fullName: "UAT Supplier",
            email: "uat_supplier@test.com",
            password: hashedPassword,
            role: "farmer"
        }).save();

        await new User({
            fullName: "UAT Buyer",
            email: "uat_buyer@test.com",
            password: hashedPassword,
            role: "buyer"
        }).save();

        // 3. Seed Marketplace Inventory
        // FIX: Changed 'user' to 'farmer' to match your Schema Error
        const p1 = await new Product({
            farmer: farmer._id, // <--- FIXED THIS LINE
            productName: "Fresh Red Tomatoes",
            category: "Vegetables",
            price: 150,
            unit: "kg",
            quantity: 200,
            description: "Organic farm fresh tomatoes",
            image: "https://placehold.co/600x400"
        }).save();
        tomatoId = p1._id;

        const p2 = await new Product({
            farmer: farmer._id, // <--- FIXED THIS LINE
            productName: "Sweet Mangoes",
            category: "Fruits",
            price: 300,
            unit: "kg",
            quantity: 100,
            description: "Ripe mangoes from the coast",
            image: "https://placehold.co/600x400"
        }).save();
        mangoId = p2._id;

        await new Product({
            farmer: farmer._id, // <--- FIXED THIS LINE
            productName: "Kales",
            category: "Vegetables",
            price: 50,
            unit: "bunch",
            quantity: 500,
            description: "Green leafy vegetables",
            image: "https://placehold.co/600x400"
        }).save();
    });

    after(async () => {
        await User.deleteMany({ email: { $in: ["uat_buyer@test.com", "uat_supplier@test.com"] } });
        await Product.deleteMany({ productName: { $in: ["Fresh Red Tomatoes", "Sweet Mangoes", "Kales"] } });
    });

    it('Step 1: Buyer logs in successfully', async () => {
        const res = await chai.request(app)
            .post('/api/login')
            .send({ email: "uat_buyer@test.com", password: "password123" });

        expect(res).to.have.status(200);
        buyerToken = res.body.token;
    });


    it('Step 2: Buyer views all available products', async () => {
        const res = await chai.request(app)
            .get('/api/products')
            .set('Authorization', `Bearer ${buyerToken}`);

        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        expect(res.body.length).to.be.gte(3);
    });

    it('Step 3: Buyer searches for a specific product (Mangoes)', async () => {
        const res = await chai.request(app)
            .get('/api/products') 
            .query({ search: 'Mango' }) 
            .set('Authorization', `Bearer ${buyerToken}`);

        expect(res).to.have.status(200);
    });

    it('Step 4: Buyer filters products by Category (Vegetables)', async () => {
        const res = await chai.request(app)
            .get('/api/products')
            .query({ category: 'Vegetables' }) 
            .set('Authorization', `Bearer ${buyerToken}`);

        expect(res).to.have.status(200);
    });
    
});