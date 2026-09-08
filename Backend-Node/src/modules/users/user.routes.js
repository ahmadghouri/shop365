const { Router } = require('express');
const router = Router();
const ctrl = require('./user.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { cloudinaryUpload } = require('../../middleware/cloudinary-upload.middleware');

// Laravel: GET /refreshUser (under auth)
router.get('/refreshUser', authenticate, ctrl.refreshUser);

// Laravel: PUT /update/{id}
router.put('/update/:id', ctrl.updateUser);

// Upload a profile avatar to Cloudinary and persist the URL
router.put('/update/:id/avatar', cloudinaryUpload.single('image'), ctrl.uploadAvatar);

// Laravel: DELETE /users/cleanup
router.delete('/users/cleanup', ctrl.deleteUsers);

module.exports = router;
