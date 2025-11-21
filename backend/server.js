import express from "express";
import routes  from "./routes/routes.js"
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// IMPORT ROUTES
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();
console.log(process.env.MONGO_URI);

const app = express();
app.use(cors());

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

app.listen (5001,() => {
 console.log("Server Started on http://localhost:5001");
 console.log("Frontend available at http://localhost:5001");
});



// app.get("/", (req,res) => { 
//     res.status(200).send("products");
// });