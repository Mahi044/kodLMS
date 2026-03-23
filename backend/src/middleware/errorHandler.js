/**
 * Global error handler middleware
 * Catches unhandled errors and returns a JSON error response.
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Prisma known request error
  if (err.code && err.code.startsWith('P')) {
    return res.status(400).json({ error: 'Database error', details: err.message });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  const response = { error: message };

  // Include lock info for 403 lock errors
  if (err.locked !== undefined) response.locked = err.locked;
  if (err.unlock_reason) response.unlock_reason = err.unlock_reason;

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
