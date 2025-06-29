# 💳 M-Pesa Daraja API Integration Guide

## 🚀 Quick Start (10 Minutes)

### Step 1: Create Safaricom Developer Account
1. Visit [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Sign up for a free developer account
3. Verify your email and complete profile

### Step 2: Create an App
1. Go to **"My Apps"** → **"Add a new app"**
2. Choose **"Lipa na M-Pesa Online"**
3. Fill in app details:
   - **App Name**: FundiConnect
   - **Description**: Service marketplace payments
   - **Environment**: Sandbox (for testing)

### Step 3: Get API Credentials
After creating the app, you'll get:
- **Consumer Key**: `your_consumer_key`
- **Consumer Secret**: `your_consumer_secret`
- **Business Short Code**: `174379` (sandbox)
- **Passkey**: `your_passkey`

### Step 4: Configure Environment Variables
```bash
# Add to your .env file
VITE_MPESA_CONSUMER_KEY=your_consumer_key
VITE_MPESA_CONSUMER_SECRET=your_consumer_secret
VITE_MPESA_SHORTCODE=174379
VITE_MPESA_PASSKEY=your_passkey
VITE_MPESA_ENVIRONMENT=sandbox
```

### Step 5: Test the Integration
```bash
# Start your app
npm run dev

# Try booking a service and paying with M-Pesa
# Use test phone number: 254708374149
```

## 🧪 Testing with Sandbox

### Test Phone Numbers
Safaricom provides these test numbers for sandbox:
- **254708374149** - Always successful
- **254708374150** - Always fails
- **254708374151** - Timeout scenario

### Test Scenarios
```javascript
// Successful payment
phoneNumber: "254708374149"
amount: 1000
// Result: Payment successful

// Failed payment
phoneNumber: "254708374150"
amount: 1000
// Result: Payment failed

// Timeout
phoneNumber: "254708374151"
amount: 1000
// Result: Payment timeout
```

## 💰 How M-Pesa Integration Works

### 1. STK Push Flow
```
User clicks "Pay" → 
App sends STK Push → 
User receives M-Pesa prompt → 
User enters PIN → 
Payment processed → 
App receives callback → 
Booking confirmed
```

### 2. Payment States
- **Initiated**: STK push sent to user's phone
- **Pending**: User received prompt, waiting for PIN
- **Success**: Payment completed successfully
- **Failed**: Payment cancelled or failed
- **Timeout**: User didn't respond in time

### 3. Security Features
- ✅ **Encrypted communication** with Safaricom
- ✅ **No PIN storage** - entered directly on phone
- ✅ **Transaction verification** via callbacks
- ✅ **Automatic timeout** handling

## 🔧 Advanced Configuration

### Production Setup
```bash
# For production, change environment
VITE_MPESA_ENVIRONMENT=production

# Get production credentials from Safaricom
VITE_MPESA_CONSUMER_KEY=prod_consumer_key
VITE_MPESA_CONSUMER_SECRET=prod_consumer_secret
VITE_MPESA_SHORTCODE=your_business_shortcode
VITE_MPESA_PASSKEY=prod_passkey
```

### Webhook Configuration
For production, you'll need to set up webhooks:

```javascript
// server/mpesa-webhook.js
app.post('/api/mpesa/callback', (req, res) => {
  const { Body } = req.body;
  
  if (Body.stkCallback.ResultCode === 0) {
    // Payment successful
    const { Amount, MpesaReceiptNumber, PhoneNumber } = Body.stkCallback.CallbackMetadata.Item;
    
    // Update booking status in database
    updateBookingStatus(MpesaReceiptNumber, 'paid');
    
    // Send confirmation to user
    sendConfirmation(PhoneNumber, MpesaReceiptNumber);
  } else {
    // Payment failed
    console.log('Payment failed:', Body.stkCallback.ResultDesc);
  }
  
  res.status(200).json({ message: 'Callback received' });
});
```

## 📱 User Experience

### Payment Flow
1. **Service Selection**: User chooses service and provider
2. **Booking Details**: User fills in date, time, contact info
3. **Payment Method**: User selects M-Pesa
4. **Phone Number**: User enters M-Pesa number
5. **STK Push**: User receives payment prompt on phone
6. **PIN Entry**: User enters M-Pesa PIN
7. **Confirmation**: Booking confirmed with receipt

### Error Handling
- **Invalid phone number**: Clear validation message
- **Network issues**: Retry mechanism
- **Payment timeout**: Option to try again
- **Insufficient funds**: Clear error message

## 💡 Best Practices

### 1. Phone Number Validation
```javascript
const validatePhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 && 
         (cleaned.startsWith('07') || cleaned.startsWith('01'));
};
```

### 2. Amount Validation
```javascript
const validateAmount = (amount) => {
  return amount >= 1 && amount <= 150000; // M-Pesa limits
};
```

### 3. Timeout Handling
```javascript
const PAYMENT_TIMEOUT = 5 * 60 * 1000; // 5 minutes

setTimeout(() => {
  if (paymentStatus === 'pending') {
    setPaymentStatus('timeout');
    showTimeoutMessage();
  }
}, PAYMENT_TIMEOUT);
```

### 4. Status Polling
```javascript
const pollPaymentStatus = async (checkoutRequestID) => {
  const maxAttempts = 30; // 5 minutes
  let attempts = 0;
  
  const poll = async () => {
    attempts++;
    const status = await queryPaymentStatus(checkoutRequestID);
    
    if (status.resultCode === 0) {
      // Success
      handlePaymentSuccess();
    } else if (attempts < maxAttempts) {
      // Continue polling
      setTimeout(poll, 10000);
    } else {
      // Timeout
      handlePaymentTimeout();
    }
  };
  
  setTimeout(poll, 5000); // Start after 5 seconds
};
```

## 🔐 Security Considerations

### 1. API Key Security
- ✅ **Never expose keys** in frontend code
- ✅ **Use environment variables** for sensitive data
- ✅ **Rotate keys regularly** in production
- ✅ **Monitor API usage** for suspicious activity

### 2. Transaction Security
- ✅ **Validate all inputs** before processing
- ✅ **Verify callback authenticity** from Safaricom
- ✅ **Log all transactions** for audit trail
- ✅ **Implement rate limiting** to prevent abuse

### 3. Data Protection
- ✅ **Don't store PIN numbers** (handled by M-Pesa)
- ✅ **Encrypt sensitive data** in transit and at rest
- ✅ **Comply with PCI DSS** standards
- ✅ **Regular security audits**

## 📊 Analytics & Monitoring

### Transaction Metrics
```javascript
// Track payment success rates
const paymentMetrics = {
  total_attempts: 1000,
  successful_payments: 850,
  failed_payments: 100,
  timeout_payments: 50,
  success_rate: '85%'
};

// Monitor by payment method
const methodMetrics = {
  mpesa: { attempts: 900, success: 800 },
  card: { attempts: 100, success: 50 }
};
```

### Error Monitoring
```javascript
// Log payment errors
const logPaymentError = (error, context) => {
  console.error('Payment Error:', {
    error: error.message,
    context,
    timestamp: new Date().toISOString(),
    user_agent: navigator.userAgent
  });
};
```

## 🚀 Going Live

### Pre-Production Checklist
- [ ] Test all payment scenarios in sandbox
- [ ] Implement proper error handling
- [ ] Set up webhook endpoints
- [ ] Configure production API keys
- [ ] Test with real M-Pesa account
- [ ] Set up monitoring and alerts
- [ ] Prepare customer support procedures

### Production Deployment
1. **Update environment variables** to production
2. **Deploy webhook endpoints** to secure server
3. **Test with small amounts** first
4. **Monitor transactions** closely
5. **Have rollback plan** ready

## 📞 Support & Resources

### Safaricom Support
- **Developer Portal**: [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
- **Documentation**: API docs and guides
- **Support Email**: apisupport@safaricom.co.ke
- **Community Forum**: Developer community

### Testing Resources
- **Postman Collection**: Available on developer portal
- **Test Credentials**: Provided in sandbox
- **Sample Code**: Multiple language examples
- **Video Tutorials**: Step-by-step guides

Your M-Pesa integration is now ready to process secure payments for FundiConnect! 🎉

## 💳 Transaction Fees

### Sandbox (Free)
- ✅ **No charges** for testing
- ✅ **Unlimited transactions**
- ✅ **All features available**

### Production
- **Customer to Business**: KSh 0 (free for customers)
- **Business charges**: Negotiated with Safaricom
- **Typical rates**: 1-3% per transaction
- **Monthly minimums**: May apply

Contact Safaricom for production pricing details.