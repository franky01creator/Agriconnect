import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import your App and the User Model
import app from '../../backend/server.js';
import User from '../../backend/models/user.js'; // <--- Adjust path if needed

dotenv.config();

describe('Performance Tests', () => {
    
    let token;
    let testUserId;

    // 1. Setup: Create a real user in the DB before running tests
    before(async function() {
        // Ensure DB is connected (in case app doesn't connect instantly)
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }

        // Create a temporary user
        const user = await User.create({
            fullName: "Perf Test User",
            email: "user6@gmail.com",
            password: "123456"
        });

        testUserId = user._id;

        // Generate a valid token for this REAL user
        token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '15m' }
        );
    });

    // 2. Teardown: Delete the user after tests are done
    after(async function() {
        if (testUserId) {
            await User.findByIdAndDelete(testUserId);
        }
        // Optional: Close connection if you want the test script to exit cleanly
        // await mongoose.connection.close(); 
    });

    describe('API Response Time', () => {
        
        it('should respond to login within 500ms', async function() {
            this.timeout(5000); // Increased timeout to account for DB latency
            const startTime = Date.now();
            
            await request(app)
                .post('/api/login')
                .send({
                    email: "perftest@example.com", // Use the user we created in before()
                    password: "password123"
                });
            
            const responseTime = Date.now() - startTime;
            expect(responseTime).to.be.below(500);
        });

        it('should handle 100 concurrent requests', async function() {
            this.timeout(15000); // 15 seconds
            
            const requests = [];
            const startTime = Date.now();
            
            for (let i = 0; i < 100; i++) {
                requests.push(
                    request(app)
                        .get('/api/products')
                        .set('Authorization', `Bearer ${token}`) // Use the valid token
                );
            }
            
            // Fire all requests in parallel
            await Promise.all(requests);
            
            const totalTime = Date.now() - startTime;
            const averageTime = totalTime / 100;
            
            console.log(`Average response time: ${averageTime.toFixed(2)}ms`);
            
            // Expectation: Average time should be reasonable
            expect(averageTime).to.be.below(1000);
        });
    });
});