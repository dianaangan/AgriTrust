import express from 'express';
import { 
  verifyBillingInfo, 
  createPaymentIntent, 
  confirmPayment, 
  getPaymentStatus, 
  processPayment 
} from '../controllers/stripeController.js';

const router = express.Router();

// Test route to check if Stripe routes are working
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Stripe routes are working',
    timestamp: new Date().toISOString()
  });
});

// Route to verify billing information
router.post('/verify-billing', verifyBillingInfo);

// Payment API Routes
// Create a payment intent
router.post('/create-payment-intent', createPaymentIntent);

// Confirm a payment
router.post('/confirm-payment', confirmPayment);

// Get payment status
router.get('/payment-status/:paymentIntentId', getPaymentStatus);

// Process a complete payment (recommended for simple payments)
router.post('/process-payment', processPayment);

export default router;
