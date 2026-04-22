import { v2 as cloudinary } from 'cloudinary';

function cloudinaryCloudName() {
  const raw = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return typeof raw === 'string' && raw.trim() ? raw.trim() : 'colbycloud-apps';
}

cloudinary.config({
  cloud_name: cloudinaryCloudName(),
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * getCloudinary
 */

export function getCloudinary() {
  return cloudinary;
}

/**
 * getSignedImageUrl
 */

export function getSignedImageUrl(publicId, options = {}) {
  return cloudinary.url(publicId, {
    sign_url: true,
    ...options
  })
}