const { verifyToken } = require('../utils/jwt');
const User = require('../modules/users/user.model');
const LoginSession = require('../modules/auth/login-session.model');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const session = decoded.sid
      ? await LoginSession.findOne({ _id: decoded.sid, user_id: decoded.id, revoked_at: null, logged_out_at: null })
      : null;
    if (decoded.sid && !session) return res.status(401).json({ message: 'Session revoked' });
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    req.loginSession = session;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = { authenticate };
