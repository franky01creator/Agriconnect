import 'dotenv/config'; 
import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; 
import app from '../server.js';
import User from '../models/user.js';

describe('Authentication Controller', () => {

    // Global Setup: Connect to DB if not already connected
    before(async () => {
        if (mongoose.connection.readyState === 0) {
            try {
                await mongoose.connect(process.env.MONGO_URI);
            } catch (error) {
                console.error("Test DB Connection Error:", error);
            }
        }
    });

    // Global Teardown: Close DB connection after tests
    after(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
    });

    // =========================================================
    // TEST: REGISTRATION
    // =========================================================
    describe('POST /api/register', () => {
        // Cleanup before running registration tests
        before(async () => {
            await User.deleteOne({ email: "test_register@example.com" });
        });

        after(async () => {
            await User.deleteOne({ email: "test_register@example.com" });
        });

        it('should REGISTER a new user', (done) => {
            const user = {
                fullName: "Test Register",
                email: "test_register@example.com",
                password: "password123",
                role: "farmer"
            };

            request(app)
                .post('/api/register')
                .send(user)
                .end((err, res) => {
                    if (err) return done(err); // Handle request errors
                    
                    // FIX: Use res.status with .equal()
                    expect(res.status).to.equal(201); 
                    expect(res.body).to.have.property('message').eql('User registered successfully');
                    done();
                });
        });

        it('should NOT register a user without required fields', (done) => {
            const user = {
                email: "test_register@example.com"
                // Missing password, fullName, role
            };

            request(app)
                .post('/api/register')
                .send(user)
                .end((err, res) => {
                    if (err) return done(err);

                    // FIX: Use res.status with .equal()
                    expect(res.status).to.equal(400);
                    done();
                });
        });
    });

    // =========================================================
    // TEST: LOGIN
    // =========================================================
    describe('POST /api/login', () => {
        const testEmail = "test_login@example.com";
        const testPassword = "password123";

        // Setup: Create a user MANUALLY before trying to log in
        before(async () => {
            // 1. Delete if exists
            await User.deleteOne({ email: testEmail });

            // 2. Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(testPassword, salt);

            // 3. Create user
            await User.create({
                fullName: "Test Login",
                email: testEmail,
                password: hashedPassword,
                role: "farmer"
            });
        });

        // Cleanup after login tests
        after(async () => {
            await User.deleteOne({ email: testEmail });
        });

        it('should LOGIN with valid credentials', (done) => {
            const loginDetails = {
                email: testEmail,
                password: testPassword
            };

            request(app)
                .post('/api/login')
                .send(loginDetails)
                .end((err, res) => {
                    if (err) return done(err);

                    // FIX: Use res.status with .equal()
                    expect(res.status).to.equal(200);
                    expect(res.body).to.have.property('token');
                    expect(res.body).to.have.property('user');
                    done();
                });
        });

        it('should NOT login with incorrect password', (done) => {
            const loginDetails = {
                email: testEmail,
                password: "wrongpassword"
            };

            request(app)
                .post('/api/login')
                .send(loginDetails)
                .end((err, res) => {
                    if (err) return done(err);

                    // FIX: Use res.status with .equal()
                    expect(res.status).to.equal(400); 
                    done();
                });
        });
    });
});