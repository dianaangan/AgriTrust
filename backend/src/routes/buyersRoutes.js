import express from 'express';
import { getAllBuyers, getBuyer, registerBuyer, loginBuyer, updateBuyer, deleteBuyer } from '../controllers/buyersController.js';
import { protectBuyerRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getAllBuyers);
router.get("/:id", getBuyer);
router.post("/register", registerBuyer);
router.post("/login", loginBuyer);

// Protected routes (authentication required)
router.put("/:id", protectBuyerRoute, updateBuyer);
router.delete("/:id", protectBuyerRoute, deleteBuyer);

export default router;
