const prisma = require('../../utils/prisma');
const { hashPassword, comparePassword } = require('../../utils/password');
const { hashToken, getRefreshTokenExpiry } = require('../../utils/jwt');

/**
 * Create a new user
 */
async function createUser({ name, email, password, requestedRole = null }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  const password_hash = await hashPassword(password);
  return prisma.user.create({
    data: { name, email, password_hash, requested_role: requestedRole },
    select: { id: true, name: true, email: true, role: true, requested_role: true, created_at: true },
  });
}

/**
 * Find a user by email and verify password
 */
async function verifyCredentials(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

/**
 * Store a hashed refresh token in the database
 */
async function storeRefreshToken(userId, token) {
  const token_hash = hashToken(token);
  const expires_at = getRefreshTokenExpiry();

  await prisma.refreshToken.create({
    data: { user_id: userId, token_hash, expires_at },
  });
}

/**
 * Validate and consume a refresh token (for rotation)
 * Returns the associated user if valid.
 */
async function validateRefreshToken(token) {
  const token_hash = hashToken(token);

  const record = await prisma.refreshToken.findFirst({
    where: {
      token_hash,
      revoked_at: null,
      expires_at: { gt: new Date() },
    },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
  });

  if (!record) {
    const err = new Error('Invalid or expired refresh token');
    err.statusCode = 401;
    throw err;
  }

  // Revoke the old token (rotation)
  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { revoked_at: new Date() },
  });

  return record.user;
}

/**
 * Revoke a refresh token on logout
 */
async function revokeRefreshToken(token) {
  const token_hash = hashToken(token);

  await prisma.refreshToken.updateMany({
    where: { token_hash, revoked_at: null },
    data: { revoked_at: new Date() },
  });
}

module.exports = {
  createUser,
  verifyCredentials,
  storeRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
};
