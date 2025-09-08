import express from 'express';
import { getAllFarmers, getFarmer, registerFarmer, loginFarmer, updateFarmer, deleteFarmer, verifyFarmer, unverifyFarmer, checkUsernameAvailability } from '../controllers/farmersController.js';
import { protectFarmerRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getAllFarmers);
router.get("/check-username", checkUsernameAvailability);
router.get("/:id", getFarmer);
router.post("/register", registerFarmer);
router.post("/login", loginFarmer);

// Protected routes (authentication required)
router.put("/:id", protectFarmerRoute, updateFarmer);
router.delete("/:id", protectFarmerRoute, deleteFarmer);

// Admin routes for verification (you may want to add admin middleware here)
router.patch("/:id/verify", verifyFarmer);
router.patch("/:id/unverify", unverifyFarmer);

export default router;



