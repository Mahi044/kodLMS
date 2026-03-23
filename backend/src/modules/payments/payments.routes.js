const { Router } = require('express');
const authenticate = require('../../middleware/authenticate');
const paymentsController = require('./payments.controller');

const router = Router();

// Authenticated: create a checkout session
router.post('/create-checkout-session', authenticate, paymentsController.createCheckoutSession);

// Stripe webhook — NO auth, raw body handled in index.js
router.post('/webhook', paymentsController.webhook);

module.exports = router;
