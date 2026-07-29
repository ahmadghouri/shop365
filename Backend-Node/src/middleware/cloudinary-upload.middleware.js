const multer = require('multer');
const { MAX_FILE_SIZE } = require('../config/env');

const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];

const cloudinaryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, callback) => {
    if (allowedTypes.includes(file.mimetype)) return callback(null, true);
    callback(new Error('Invalid file type. Only JPEG, PNG, GIF, SVG, WebP allowed.'));
  },
});

module.exports = { cloudinaryUpload };
