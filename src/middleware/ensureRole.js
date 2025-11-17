/**
 * ensureRole middleware factory
 * Usage: ensureRole('user') or ensureRole(['user','admin'])
 * Requires `ensureAuth` to have already populated `req.user`.
 */
module.exports = function ensureRole(required) {
  const allowed = Array.isArray(required) ? required : [required];
  return function (req, res, next) {
    try {
      const role = req.user && req.user.role ? String(req.user.role) : '';
      if (!role) return res.status(401).json({ error: 'Unauthorized' });
      if (allowed.includes(role)) return next();
      return res.status(403).json({ error: 'Forbidden - role not allowed' });
    } catch (e) {
      return res.status(500).json({ error: 'Server error' });
    }
  };
};
