const paymentsService = require('./payments.service');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/payments/create-checkout-session
 * Body: { subjectId }
 */
async function createCheckoutSession(req, res) {
  const { subjectId } = req.body;
  if (!subjectId) {
    return res.status(400).json({ error: 'subjectId is required' });
  }

  const result = await paymentsService.createCheckoutSession(req.user.id, subjectId);
  res.json(result);
}

/**
 * POST /api/payments/webhook
 * Stripe sends raw body — parsed upstream with express.raw()
 */
async function webhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  await paymentsService.handleWebhookEvent(event);
  res.json({ received: true });
}

module.exports = { createCheckoutSession, webhook };
