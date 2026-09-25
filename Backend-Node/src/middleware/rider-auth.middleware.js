const { verifyToken } = require('../utils/jwt');
const Rider = require('../modules/riders/rider.model');

/**
 * Authenticates the rider/driver app. Riders are a self-contained collection
 * (NOT linked to the User model), so their token carries a `rid` (rider id).
 * Sets req.rider on success.
 */
async function authenticateRider(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded.rid) {
      return res.status(401).json({ message: 'Not a rider token' });
    }

    const rider = await Rider.findById(decoded.rid);
    if (!rider) return res.status(401).json({ message: 'Rider not found' });
    if (rider.status !== 'active' || rider.deleted_at) {
      return res.status(403).json({ message: 'Rider account is not active' });
    }

    req.rider = rider;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = { authenticateRider };
