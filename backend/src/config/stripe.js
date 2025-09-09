import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY in environment. Set it in your .env file.');
}

// Initialize Stripe with your secret key. Omit apiVersion to use account default.
export const stripe = new Stripe(stripeSecretKey);

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: stripePublishableKey,
  secretKey: stripeSecretKey
};
