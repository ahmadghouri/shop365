const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { nanoid } = require('nanoid');
const { UPLOAD_PATH, MAX_FILE_SIZE } = require('../config/env');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function createStorage(subdir = 'uploads') {
  const dir = path.resolve(UPLOAD_PATH, subdir);
  ensureDir(dir);

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${nanoid()}${ext}`);
    },
  });
}

function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, SVG, WebP allowed.'));
  }
}

function createUploadMiddleware(subdir = 'uploads', maxSize) {
  return multer({
    storage: createStorage(subdir),
    fileFilter,
    limits: { fileSize: maxSize || MAX_FILE_SIZE },
  });
}

const upload = createUploadMiddleware();

module.exports = { createUploadMiddleware, upload };
