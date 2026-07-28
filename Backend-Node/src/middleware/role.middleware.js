const { UserRole } = require('../common/enums');

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  };
}

const requireAdmin = requireRole(UserRole.ADMIN);
const requireRestaurantAdmin = requireRole(UserRole.RESTAURANT_ADMIN, UserRole.ADMIN);

module.exports = { requireRole, requireAdmin, requireRestaurantAdmin };
