import dotenv from "dotenv";
dotenv.config(); // Load environment variables FIRST

import express from "express";
import routes  from "./routes/routes.js"
import { connectDB } from "./config/db.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import passport from "./config/passport.js";

// IMPORT ROUTES
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';


const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5001',
    credentials: true
}));

// Session configuration (needed for OAuth flow)
app.use(session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
connectDB();

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// MOUNT API ROUTES
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes); 
app.use('/api/admin', adminRoutes);
app.use("/api", routes);

// Serve index.html for root route (which redirects to register.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 5001; // Use Render's port, or 5001 locally

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend available at http://localhost:${PORT}`);
});

export default app;



// app.get("/", (req,res) => { 
//     res.status(200).send("products");
// });