const nodemailer = require('nodemailer');

/**
 * Nodemailer transporter — configured from .env SMTP settings.
 * Gracefully handles missing config (logs instead of crashing).
 */
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn('⚠️  Email not configured — SMTP_HOST / SMTP_USER missing in .env');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

/**
 * Send welcome email on registration.
 */
async function sendWelcomeEmail(user) {
  const transport = getTransporter();
  if (!transport) return;

  try {
    await transport.sendMail({
      from: process.env.EMAIL_FROM || 'LearnFlow <noreply@learnflow.com>',
      to: user.email,
      subject: '🎓 Welcome to LearnFlow!',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #6366f1; margin: 0;">LearnFlow</h1>
            <p style="color: #64748b; margin-top: 4px;">Your Learning Management System</p>
          </div>
          <h2 style="color: #1e1b4b;">Welcome, ${user.name}! 👋</h2>
          <p style="color: #475569; line-height: 1.6;">
            Your account has been created successfully. You can now explore our courses,
            enroll in subjects, and start your learning journey.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard"
               style="background: #6366f1; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Go to Dashboard
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            This email was sent from LearnFlow. If you didn't create an account, please ignore this email.
          </p>
        </div>
      `,
    });
    console.log(`📧 Welcome email sent to ${user.email}`);
  } catch (err) {
    console.error('❌ Failed to send welcome email:', err.message);
  }
}

/**
 * Send course completion congratulations email.
 */
async function sendCompletionEmail(user, subjectTitle) {
  const transport = getTransporter();
  if (!transport) return;

  try {
    await transport.sendMail({
      from: process.env.EMAIL_FROM || 'LearnFlow <noreply@learnflow.com>',
      to: user.email,
      subject: `🎉 You completed "${subjectTitle}"!`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #6366f1; margin: 0;">LearnFlow</h1>
          </div>
          <h2 style="color: #1e1b4b;">Congratulations, ${user.name}! 🎉</h2>
          <p style="color: #475569; line-height: 1.6;">
            You have successfully completed <strong>${subjectTitle}</strong>.
            Your certificate is now available for download.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard"
               style="background: #10b981; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Download Certificate
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            Keep learning, keep growing! 🚀
          </p>
        </div>
      `,
    });
    console.log(`📧 Completion email sent to ${user.email} for "${subjectTitle}"`);
  } catch (err) {
    console.error('❌ Failed to send completion email:', err.message);
  }
}

module.exports = { sendWelcomeEmail, sendCompletionEmail };
