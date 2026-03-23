const prisma = require('../../utils/prisma');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe Checkout Session for a paid course.
 * Returns the session URL to redirect the user.
 */
async function createCheckoutSession(userId, subjectId) {
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject || !subject.is_published) {
    const err = new Error('Course not found');
    err.statusCode = 404;
    throw err;
  }

  if (subject.is_free) {
    const err = new Error('This course is free — enroll directly');
    err.statusCode = 400;
    throw err;
  }

  // Check if already enrolled
  const existing = await prisma.enrollment.findUnique({
    where: { user_id_subject_id: { user_id: userId, subject_id: subjectId } },
  });
  if (existing) {
    const err = new Error('Already enrolled in this course');
    err.statusCode = 400;
    throw err;
  }

  // Fetch user for email
  const user = await prisma.user.findUnique({ where: { id: userId } });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: user.email,
    metadata: {
      userId: String(userId),
      subjectId: String(subjectId),
    },
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: subject.title,
            description: subject.description || `Enroll in ${subject.title}`,
          },
          unit_amount: subject.price_cents,
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.CLIENT_URL}/subjects/${subjectId}?payment=success`,
    cancel_url: `${process.env.CLIENT_URL}/subjects/${subjectId}?payment=cancelled`,
  });

  // Store pending payment record
  await prisma.payment.create({
    data: {
      user_id: userId,
      subject_id: subjectId,
      stripe_session_id: session.id,
      amount_cents: subject.price_cents,
      currency: 'usd',
      status: 'pending',
    },
  });

  return { url: session.url, sessionId: session.id };
}

/**
 * Handle Stripe webhook events.
 * On checkout.session.completed → mark payment as completed + enroll user.
 */
async function handleWebhookEvent(event) {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = parseInt(session.metadata.userId);
    const subjectId = parseInt(session.metadata.subjectId);

    // Update payment record
    await prisma.payment.updateMany({
      where: { stripe_session_id: session.id },
      data: {
        status: 'completed',
        stripe_payment_intent: session.payment_intent || null,
      },
    });

    // Auto-enroll user
    await prisma.enrollment.upsert({
      where: { user_id_subject_id: { user_id: userId, subject_id: subjectId } },
      create: { user_id: userId, subject_id: subjectId },
      update: {},
    });

    console.log(`✅ Payment completed — enrolled user ${userId} in subject ${subjectId}`);
  }
}

module.exports = { createCheckoutSession, handleWebhookEvent };
