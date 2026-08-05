const cloudinary = require('../config/cloudinary');
const { CLOUDINARY_ROOT_FOLDER } = require('../config/env');

function uploadToCloudinary(file, folder = 'misc') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `${CLOUDINARY_ROOT_FOLDER}/${folder}`, resource_type: 'image', unique_filename: true },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(file.buffer);
  });
}

module.exports = { uploadToCloudinary };
