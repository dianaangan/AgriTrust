import express from 'express';
import { getAllDeliveryDrivers, getDeliveryDriver, registerDeliveryDriver, loginDeliveryDriver, updateDeliveryDriver, deleteDeliveryDriver, requestPasswordReset, verifyResetCode, resetPassword, checkEmail } from '../controllers/deliverydriversController.js';
import { protectDeliveryDriverRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getAllDeliveryDrivers);
router.get("/:id", getDeliveryDriver);
router.post("/register", registerDeliveryDriver);
router.post("/login", loginDeliveryDriver);
router.post("/forgot-password", requestPasswordReset);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);
router.post("/check-email", checkEmail);

// Protected routes (authentication required)
router.put("/:id", protectDeliveryDriverRoute, updateDeliveryDriver);
router.delete("/:id", protectDeliveryDriverRoute, deleteDeliveryDriver);

export default router;
