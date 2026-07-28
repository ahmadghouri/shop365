const { Router } = require('express');
const router = Router();
const ctrl = require('./upload.controller');
const { upload } = require('../../middleware/upload.middleware');

router.post('/upload/image', upload.single('image'), ctrl.uploadImage);
router.post('/upload/images', upload.array('images', 10), ctrl.uploadImages);

module.exports = router;
