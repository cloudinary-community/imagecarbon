const rawCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_CLOUD_NAME =
  typeof rawCloudName === 'string' && rawCloudName.trim()
    ? rawCloudName.trim()
    : 'colbycloud-apps';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: CLOUDINARY_CLOUD_NAME,
  },
};

module.exports = nextConfig;
