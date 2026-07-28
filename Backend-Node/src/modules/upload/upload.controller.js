const { successResponse } = require('../../utils/api-response');

async function uploadImage(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ status: false, message: 'No file uploaded' });
    const url = `/uploads/${req.file.filename}`;
    successResponse(res, { url, filename: req.file.filename }, 'Image uploaded successfully');
  } catch (error) { next(error); }
}

async function uploadImages(req, res, next) {
  try {
    if (!req.files || !req.files.length) return res.status(400).json({ status: false, message: 'No files uploaded' });
    const urls = req.files.map(f => `/uploads/${f.filename}`);
    successResponse(res, { urls }, 'Images uploaded successfully');
  } catch (error) { next(error); }
}

module.exports = { uploadImage, uploadImages };
