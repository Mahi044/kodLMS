/**
 * Middleware factory to enforce role-based access control (RBAC).
 * Assumes req.user is already populated by authenticate middleware.
 * @param {string} requiredRole - The role required to access the route
 */
function requireRole(requiredRole) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
}

module.exports = requireRole;
