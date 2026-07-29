const { Router } = require('express');
const router = Router();
const ctrl = require('./upload.controller');
const { cloudinaryUpload } = require('../../middleware/cloudinary-upload.middleware');

router.post('/upload/image', cloudinaryUpload.single('image'), ctrl.uploadImage);
router.post('/upload/images', cloudinaryUpload.array('images', 10), ctrl.uploadImages);

module.exports = router;
