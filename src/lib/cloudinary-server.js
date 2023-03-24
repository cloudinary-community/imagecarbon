import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
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