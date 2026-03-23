const authService = require('./auth.service');
const { generateAccessToken, generateRefreshToken } = require('../../utils/jwt');
// Cookie options for refresh token
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Required for cross-domain Vercel <-> Render
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: '/',
};

/**
 * POST /api/auth/register
 * Creates a new user account and returns tokens.
 */
async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const user = await authService.createUser({ name, email, password });

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store refresh token hash in DB
  await authService.storeRefreshToken(user.id, refreshToken);

  // Set refresh token as HTTP-only cookie
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  res.status(201).json({
    message: 'Registration successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    accessToken,
  });
}

/**
 * POST /api/auth/login
 * Validates credentials and returns tokens.
 */
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await authService.verifyCredentials(email, password);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await authService.storeRefreshToken(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    accessToken,
  });
}

/**
 * POST /api/auth/refresh
 * Rotates refresh token and returns a new access token.
 */
async function refresh(req, res) {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  // Validate, revoke old token, get user
  const user = await authService.validateRefreshToken(token);

  // Generate new token pair
  const accessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  await authService.storeRefreshToken(user.id, newRefreshToken);

  res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);

  res.json({
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
}

/**
 * POST /api/auth/logout
 * Revokes refresh token and clears cookie.
 */
async function logout(req, res) {
  const token = req.cookies.refreshToken;

  if (token) {
    await authService.revokeRefreshToken(token);
  }

  res.clearCookie('refreshToken', { path: '/' });
  res.json({ message: 'Logged out successfully' });
}

module.exports = { register, login, refresh, logout };
