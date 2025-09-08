import express from 'express';
import { getAllDeliveryDrivers, getDeliveryDriver, registerDeliveryDriver, loginDeliveryDriver, updateDeliveryDriver, deleteDeliveryDriver, checkUsernameAvailability } from '../controllers/deliverydriversController.js';
import { protectDeliveryDriverRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getAllDeliveryDrivers);
router.get("/check-username", checkUsernameAvailability);
router.get("/:id", getDeliveryDriver);
router.post("/register", registerDeliveryDriver);
router.post("/login", loginDeliveryDriver);

// Protected routes (authentication required)
router.put("/:id", protectDeliveryDriverRoute, updateDeliveryDriver);
router.delete("/:id", protectDeliveryDriverRoute, deleteDeliveryDriver);

export default router;
