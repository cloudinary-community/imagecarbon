const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export function getCloudinary() {
  return cloudinary;
}

export function getSignedImageUrl(publicId, options = {}) {
  return cloudinary.url(publicId, {
    sign_url: true,
    ...options
  })
}