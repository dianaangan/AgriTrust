import express from 'express';
import { getAllFarmers, getFarmer, registerFarmer, loginFarmer, updateFarmer, deleteFarmer } from '../controllers/farmersController.js';
import { protectFarmerRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get("/", getAllFarmers);
router.get("/test-cloudinary", async (req, res) => {
  try {
    const cloudinary = await import('../config/cloudinary.js');
    const testUpload = await cloudinary.default.uploader.upload(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      { folder: 'agritrust/test' }
    );
    res.json({ 
      success: true, 
      message: 'Cloudinary is working',
      uploadUrl: testUpload.secure_url
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Cloudinary test failed',
      error: error.message
    });
  }
});
router.get("/:id", getFarmer);
router.post("/register", registerFarmer);
router.post("/login", loginFarmer);

// Protected routes (authentication required)
router.put("/:id", protectFarmerRoute, updateFarmer);
router.delete("/:id", protectFarmerRoute, deleteFarmer);

export default router;