# Payment API Documentation

## Base URL
```
http://192.168.1.2:5001/api/stripe
```

## Endpoints

### 1. Test Endpoint
**GET** `/test`

Check if the payment API is working.

**Response:**
```json
{
  "success": true,
  "message": "Stripe routes are working",
  "timestamp": "2025-09-03T19:51:46.997Z"
}
```

---

### 2. Verify Billing Information
**POST** `/verify-billing`

Verify card information without processing a payment.

**Request Body:**
```json
{
  "cardNumber": "4242424242424242",
  "expiryMonth": "12",
  "expiryYear": "2025",
  "cvc": "123",
  "email": "test@example.com",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Billing information verified successfully",
  "paymentMethodId": "pm_test_1756927122862",
  "paymentIntentId": "pi_test_1756927122862"
}
```

---

### 3. Create Payment Intent
**POST** `/create-payment-intent`

Create a payment intent for future payment processing.

**Request Body:**
```json
{
  "amount": 25.99,
  "currency": "usd",
  "customerEmail": "test@example.com",
  "customerName": "John Doe",
  "description": "Product purchase"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment intent created successfully",
  "paymentIntent": {
    "id": "pi_test_1756929119888",
    "amount": 2599,
    "currency": "usd",
    "status": "requires_payment_method",
    "client_secret": "pi_test_1756929119888_secret_test",
    "metadata": {
      "customer_email": "test@example.com",
      "customer_name": "John Doe",
      "description": "Product purchase"
    }
  }
}
```

---

### 4. Confirm Payment
**POST** `/confirm-payment`

Confirm a payment using a payment intent and payment method.

**Request Body:**
```json
{
  "paymentIntentId": "pi_test_1756929119888",
  "paymentMethodId": "pm_test_1756927122862"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment confirmed successfully",
  "paymentIntent": {
    "id": "pi_test_1756929119888",
    "status": "succeeded",
    "amount_received": 1000,
    "currency": "usd",
    "payment_method": "pm_test_1756927122862",
    "charges": {
      "data": [{
        "id": "ch_test_1756929125197",
        "amount": 1000,
        "status": "succeeded"
      }]
    }
  }
}
```

---

### 5. Get Payment Status
**GET** `/payment-status/:paymentIntentId`

Get the status of a payment intent.

**URL Parameters:**
- `paymentIntentId`: The payment intent ID

**Response:**
```json
{
  "success": true,
  "paymentIntent": {
    "id": "pi_test_123456789",
    "status": "succeeded",
    "amount": 1000,
    "currency": "usd",
    "created": 1756929125197,
    "metadata": {
      "customer_email": "test@example.com",
      "description": "Test payment"
    }
  }
}
```

---

### 6. Process Payment (Recommended)
**POST** `/process-payment`

Process a complete payment in one step. This is the recommended endpoint for simple payments.

**Request Body:**
```json
{
  "amount": 15.50,
  "currency": "usd",
  "cardNumber": "4242424242424242",
  "expiryMonth": "12",
  "expiryYear": "2025",
  "cvc": "123",
  "customerEmail": "test@example.com",
  "customerName": "Jane Doe",
  "description": "Product purchase"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "payment": {
    "id": "pi_test_1756929125197",
    "amount": 1550,
    "currency": "usd",
    "status": "succeeded",
    "payment_method": "pm_test_1756929125197",
    "customer_email": "test@example.com",
    "customer_name": "Jane Doe",
    "description": "Product purchase",
    "created": 1756929125197,
    "charges": {
      "data": [{
        "id": "ch_test_1756929125197",
        "amount": 1550,
        "status": "succeeded"
      }]
    }
  }
}
```

---

## Test Card Numbers

For testing purposes, use these card numbers:

| Card Number | Type | Result |
|-------------|------|--------|
| `4242424242424242` | Visa | ✅ Success |
| `5555555555554444` | Mastercard | ✅ Success |
| `378282246310005` | American Express | ✅ Success |
| `6011111111111117` | Discover | ✅ Success |
| `4000000000000002` | Visa | ❌ Declined |
| `4000000000009995` | Visa | ❌ Insufficient Funds |

**Note:** Use any future expiry date (e.g., 12/25) and any 3-digit CVC (e.g., 123).

---

## Error Responses

### Validation Errors (400)
```json
{
  "success": false,
  "message": "Missing required billing information"
}
```

### Card Declined (400)
```json
{
  "success": false,
  "message": "Your card was declined. Please try a different card.",
  "error": "card_declined"
}
```

### Insufficient Funds (400)
```json
{
  "success": false,
  "message": "Your card has insufficient funds.",
  "error": "insufficient_funds"
}
```

### Server Errors (500)
```json
{
  "success": false,
  "message": "Failed to process payment",
  "error": "Error details"
}
```

---

## Usage Examples

### Simple Payment Processing
```javascript
const response = await fetch('http://192.168.1.2:5001/api/stripe/process-payment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 29.99,
    cardNumber: '4242424242424242',
    expiryMonth: '12',
    expiryYear: '2025',
    cvc: '123',
    customerEmail: 'customer@example.com',
    customerName: 'John Doe',
    description: 'Product purchase'
  })
});

const result = await response.json();
if (result.success) {
  console.log('Payment successful:', result.payment);
} else {
  console.error('Payment failed:', result.message);
}
```

### Two-Step Payment Process
```javascript
// Step 1: Create payment intent
const intentResponse = await fetch('http://192.168.1.2:5001/api/stripe/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 50.00,
    customerEmail: 'customer@example.com',
    customerName: 'Jane Doe',
    description: 'Service payment'
  })
});

const intent = await intentResponse.json();

// Step 2: Verify billing and confirm payment
const verifyResponse = await fetch('http://192.168.1.2:5001/api/stripe/verify-billing', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cardNumber: '4242424242424242',
    expiryMonth: '12',
    expiryYear: '2025',
    cvc: '123',
    email: 'customer@example.com',
    name: 'Jane Doe'
  })
});

const verification = await verifyResponse.json();

if (verification.success) {
  // Step 3: Confirm payment
  const confirmResponse = await fetch('http://192.168.1.2:5001/api/stripe/confirm-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paymentIntentId: intent.paymentIntent.id,
      paymentMethodId: verification.paymentMethodId
    })
  });
  
  const confirmation = await confirmResponse.json();
  console.log('Payment confirmed:', confirmation);
}
```
