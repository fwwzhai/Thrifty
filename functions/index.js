const functions = require('firebase-functions');
const admin = require('firebase-admin'); 
const express = require('express'); 
const cors = require('cors');
const stripe = require('stripe')('sk_test_51QurWO2aNN6Ml18124AOXeckL5zybgyP9UY89LQyMG79kaouSJeeDQQ5XDPRcxC4Hcp57mNPPu669alJxKsVJx8N00SclIjlyc');

// Initialize Firebase Admin
admin.initializeApp();

const app = express(); 

// 🔥 Use CORS Middleware
app.use(cors({ origin: true }));

app.use(express.json()); // 🔥 Parse JSON requests

// 🔥 Test Route to Debug
app.get('/test', (req, res) => {
  res.send("API is working. If you see this, Cloud Run is okay.");
});

// 🔥 Route for Payment Intent
app.post('/createPaymentIntent', async (req, res) => {
  try {
      const { amount, currency } = req.body;
  
      if (!amount || !currency) {
          return res.status(400).json({ error: 'Amount and currency are required.' });
      }
  
      // 🔥 Force Stripe to use 'card' for MYR payments
      const paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency,
          payment_method: 'pm_card_visa', // 🔥 Use Visa Test Card
          payment_method_types: ['card']   // 🔥 Explicitly use 'card'
      });
  
      console.log('Payment Intent:', paymentIntent);
  
      return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
      console.error("Payment Intent Error:", error);
      return res.status(500).json({ error: error.message });
  }
});


// 🔥 Export Express App as Cloud Function
exports.api = functions.https.onRequest(app); 
