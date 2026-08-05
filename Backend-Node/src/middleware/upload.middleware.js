const multer = require('multer');
const { MAX_FILE_SIZE } = require('../config/env');

const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];

function fileFilter(req, file, cb) {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, SVG, WebP allowed.'));
  }
}

function createUploadMiddleware(subdir = 'uploads', maxSize) {
  return multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: maxSize || MAX_FILE_SIZE },
  });
}

const upload = createUploadMiddleware();

module.exports = { createUploadMiddleware, upload };
