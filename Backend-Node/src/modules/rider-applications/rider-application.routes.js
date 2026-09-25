const { Router } = require('express');
const router = Router();
const ctrl = require('./rider-application.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { cloudinaryUpload } = require('../../middleware/cloudinary-upload.middleware');

// Accept the four document/photo images alongside the form fields.
const uploadFields = cloudinaryUpload.fields([
  { name: 'cnic_front_image', maxCount: 1 },
  { name: 'cnic_back_image', maxCount: 1 },
  { name: 'photo_image', maxCount: 1 },
  { name: 'vehicle_image', maxCount: 1 },
]);

router.post('/rider-applications', authenticate, uploadFields, ctrl.store);
router.get('/rider-applications/me', authenticate, ctrl.myApplication);
router.post('/rider-applications/reupload', authenticate, uploadFields, ctrl.reupload);
router.get('/rider-applications', authenticate, ctrl.index);

module.exports = router;
