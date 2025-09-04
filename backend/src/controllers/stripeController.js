import { stripe } from '../config/stripe.js';

// Verify billing information with Stripe
export const verifyBillingInfo = async (req, res) => {
  try {
    const { cardNumber, expiryMonth, expiryYear, cvc, email, name } = req.body;

    // Validate required fields
    if (!cardNumber || !expiryMonth || !expiryYear || !cvc || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required billing information'
      });
    }

    // Basic card validation for testing
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    
    // Check if it's a valid test card number
    const validTestCards = [
      '4242424242424242', // Visa
      '4000000000000002', // Visa (declined)
      '4000000000009995', // Visa (insufficient funds)
      '5555555555554444', // Mastercard
      '378282246310005',  // American Express
      '6011111111111117', // Discover
    ];

    if (!validTestCards.includes(cleanCardNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid test card number. Please use a valid test card.'
      });
    }

    // Check expiry date
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const expYear = parseInt(expiryYear);
    const expMonth = parseInt(expiryMonth);

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      return res.status(400).json({
        success: false,
        message: 'Card has expired'
      });
    }

    // Check CVC format
    if (!/^\d{3,4}$/.test(cvc)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid CVC format'
      });
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // If we get here, the card information is valid for testing
    res.json({
      success: true,
      message: 'Billing information verified successfully',
      paymentMethodId: `pm_test_${Date.now()}`,
      paymentIntentId: `pi_test_${Date.now()}`
    });

  } catch (error) {
    console.error('Billing verification error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to verify billing information',
      error: error.message
    });
  }
};

// Create a payment intent
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'usd', customerEmail, customerName, description } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required and must be greater than 0'
      });
    }

    // Convert amount to cents (Stripe expects amounts in cents)
    const amountInCents = Math.round(amount * 100);

    // For testing, we'll create a mock payment intent
    const paymentIntent = {
      id: `pi_test_${Date.now()}`,
      amount: amountInCents,
      currency: currency,
      status: 'requires_payment_method',
      client_secret: `pi_test_${Date.now()}_secret_test`,
      metadata: {
        customer_email: customerEmail,
        customer_name: customerName,
        description: description
      }
    };

    res.json({
      success: true,
      message: 'Payment intent created successfully',
      paymentIntent: paymentIntent
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
};

// Confirm a payment
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;

    // Validate required fields
    if (!paymentIntentId || !paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID and payment method ID are required'
      });
    }

    // For testing, we'll simulate a successful payment confirmation
    const paymentIntent = {
      id: paymentIntentId,
      status: 'succeeded',
      amount_received: 1000, // $10.00 in cents
      currency: 'usd',
      payment_method: paymentMethodId,
      charges: {
        data: [{
          id: `ch_test_${Date.now()}`,
          amount: 1000,
          status: 'succeeded'
        }]
      }
    };

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      paymentIntent: paymentIntent
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: error.message
    });
  }
};

// Get payment status
export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required'
      });
    }

    // For testing, we'll return a mock payment status
    const paymentIntent = {
      id: paymentIntentId,
      status: 'succeeded',
      amount: 1000,
      currency: 'usd',
      created: Date.now(),
      metadata: {
        customer_email: 'test@example.com',
        description: 'Test payment'
      }
    };

    res.json({
      success: true,
      paymentIntent: paymentIntent
    });

  } catch (error) {
    console.error('Payment status retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment status',
      error: error.message
    });
  }
};

// Process a complete payment (recommended for simple payments)
export const processPayment = async (req, res) => {
  try {
    const { 
      amount, 
      currency = 'usd', 
      cardNumber, 
      expiryMonth, 
      expiryYear, 
      cvc, 
      customerEmail, 
      customerName, 
      description 
    } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required and must be greater than 0'
      });
    }

    if (!cardNumber || !expiryMonth || !expiryYear || !cvc || !customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Card information and customer email are required'
      });
    }

    // Basic card validation (same as billing verification)
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    const validTestCards = [
      '4242424242424242', // Visa
      '4000000000000002', // Visa (declined)
      '4000000000009995', // Visa (insufficient funds)
      '5555555555554444', // Mastercard
      '378282246310005',  // American Express
      '6011111111111117', // Discover
    ];

    if (!validTestCards.includes(cleanCardNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid test card number. Please use a valid test card.'
      });
    }

    // Check if it's a declined card
    if (cleanCardNumber === '4000000000000002') {
      return res.status(400).json({
        success: false,
        message: 'Your card was declined. Please try a different card.',
        error: 'card_declined'
      });
    }

    // Check if it's insufficient funds
    if (cleanCardNumber === '4000000000009995') {
      return res.status(400).json({
        success: false,
        message: 'Your card has insufficient funds.',
        error: 'insufficient_funds'
      });
    }

    // Convert amount to cents
    const amountInCents = Math.round(amount * 100);

    // For testing, simulate successful payment processing
    const paymentResult = {
      id: `pi_test_${Date.now()}`,
      amount: amountInCents,
      currency: currency,
      status: 'succeeded',
      payment_method: `pm_test_${Date.now()}`,
      customer_email: customerEmail,
      customer_name: customerName,
      description: description,
      created: Date.now(),
      charges: {
        data: [{
          id: `ch_test_${Date.now()}`,
          amount: amountInCents,
          status: 'succeeded'
        }]
      }
    };

    res.json({
      success: true,
      message: 'Payment processed successfully',
      payment: paymentResult
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: error.message
    });
  }
};

