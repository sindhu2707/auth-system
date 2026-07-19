import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";

dotenv.config(); // load variables from .env

connectDB(); // connect to MongoDB Atlas

const app = express();

// Middleware
app.use(express.json()); // parse JSON request bodies
app.use(cookieParser()); // parse cookies (needed for refresh token)
app.use(cors({
    origin: "http://localhost:5173", // exact frontend URL, no trailing slash
    credentials: true, // this is required for cookies to work cross-origin
}));

// Routes
app.use("/api/auth", authRoutes);

// Simple health check route
app.get("/", (req, res) => {
  res.send("Auth API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});