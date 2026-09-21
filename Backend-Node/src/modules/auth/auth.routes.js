const { Router } = require('express');
const router = Router();
const { register, login, addDetails, profile, changePassword } = require('./auth.controller');
const { updatePassword } = require('./forgot-password.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const LoginSession = require('./login-session.model');
const {
  registerSchema,
  loginSchema,
  updatePasswordSchema,
  changePasswordSchema,
} = require('./auth.validation');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/update-password', validate(updatePasswordSchema), updatePassword);
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);
router.post('/add-details', authenticate, addDetails);
router.get('/profile', authenticate, profile);
router.get('/login-sessions', authenticate, async (req, res, next) => {
  try {
    // Return all non-revoked sessions — includes logged_out_at ones for "Recent logins" history
    const raw = await LoginSession.find({ user_id: req.user._id, revoked_at: null })
      .sort({ logged_in_at: -1 })
      .limit(20)
      .lean();

    const currentId = req.loginSession?._id?.toString() || null;

    // Mark each session: is_active = no logged_out_at (still logged in)
    const sessions = raw.map((s) => ({
      ...s,
      is_active: !s.logged_out_at,
    }));

    res.json({ sessions, current_session_id: currentId });
  } catch (error) {
    next(error);
  }
});
router.post('/logout-session/:id', authenticate, async (req, res, next) => {
  try {
    // Revoking another device's session — hard revoke so it won't show as active
    await LoginSession.updateOne(
      { _id: req.params.id, user_id: req.user._id },
      { $set: { revoked_at: new Date() } },
    );
    res.json({ message: 'Session logged out' });
  } catch (error) { next(error); }
});
router.post('/logout-current', authenticate, async (req, res, next) => {
  try {
    if (req.loginSession?._id) {
      // Soft logout — keep session in history (for "Recent logins"), just mark logged_out_at
      // Do NOT set revoked_at so the entry stays visible in login history
      await LoginSession.updateOne(
        { _id: req.loginSession._id, user_id: req.user._id },
        { $set: { logged_out_at: new Date() } },
      );
    }
    res.json({ message: 'Current session logged out' });
  } catch (error) { next(error); }
});
router.post('/logout-all-sessions', authenticate, async (req, res, next) => {
  try {
    // Hard revoke all OTHER sessions (not current)
    const filter = { user_id: req.user._id, revoked_at: null };
    if (req.loginSession?._id) filter._id = { $ne: req.loginSession._id };
    await LoginSession.updateMany(filter, { $set: { revoked_at: new Date() } });
    res.json({ message: 'All sessions logged out' });
  } catch (error) { next(error); }
});

module.exports = router;
