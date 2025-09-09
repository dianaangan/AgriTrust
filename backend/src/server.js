import express from "express";
import farmersRoutes from "./routes/farmersRoutes.js";
import buyersRoutes from "./routes/buyersRoutes.js";
import deliverydriversRoutes from "./routes/deliverydriversRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";
import rateLimiter from "./middleware/rateLimiter.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Increase limit for base64 images
app.use(rateLimiter); // Apply rate limiting middleware

// Routes
app.use("/api/location", locationRoutes);
app.use("/api/farmers", farmersRoutes);
app.use("/api/buyers", buyersRoutes);
app.use("/api/deliverydrivers", deliverydriversRoutes);
app.use("/api/stripe", stripeRoutes);

// Minimal health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Minimal config endpoint for mobile apps (optional)
app.get("/api/config", (req, res) => {
  const baseUrl = process.env.PUBLIC_API_BASE_URL || `http://localhost:${PORT}/api`;
  res.json({ apiBaseUrl: baseUrl });
});


connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
  });
});


