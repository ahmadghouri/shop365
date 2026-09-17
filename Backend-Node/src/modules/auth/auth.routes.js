const { Router } = require('express');
const router = Router();
const { register, login, addDetails, profile, changePassword } = require('./auth.controller');
const { updatePassword } = require('./forgot-password.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
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

module.exports = router;
