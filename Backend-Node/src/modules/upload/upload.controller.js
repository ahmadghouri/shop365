const cloudinary = require('../../config/cloudinary');
const { CLOUDINARY_ROOT_FOLDER } = require('../../config/env');
const { successResponse } = require('../../utils/api-response');

const ALLOWED_FOLDERS = new Set([
  'categories',
  'restaurants',
  'providers',
  'products',
  'carousel',
  'prescriptions',
  'misc',
]);

function getFolder(value) {
  const folder = String(value || 'misc').toLowerCase().trim();
  if (!ALLOWED_FOLDERS.has(folder)) {
    const error = new Error(`Invalid upload folder: ${folder}`);
    error.statusCode = 422;
    throw error;
  }
  return `${CLOUDINARY_ROOT_FOLDER}/${folder}`;
}

function uploadBuffer(file, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', unique_filename: true },
      (error, result) => error ? reject(error) : resolve(result)
    );
    stream.end(file.buffer);
  });
}

async function uploadImage(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ status: false, message: 'No file uploaded' });
    const result = await uploadBuffer(req.file, getFolder(req.body.folder));
    successResponse(res, {
      url: result.secure_url,
      filename: result.public_id,
      public_id: result.public_id,
      folder: result.asset_folder || result.folder,
    }, 'Image uploaded successfully');
  } catch (error) { next(error); }
}


async function uploadImages(req, res, next) {
  try {
    if (!req.files?.length) return res.status(400).json({ status: false, message: 'No files uploaded' });
    const folder = getFolder(req.body.folder);
    const results = await Promise.all(req.files.map((file) => uploadBuffer(file, folder)));
    successResponse(res, {
      urls: results.map((result) => result.secure_url),
      public_ids: results.map((result) => result.public_id),
      folder,
    }, 'Images uploaded successfully');
  } catch (error) { next(error); }
}

module.exports = { uploadImage, uploadImages };
