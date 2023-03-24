import { getCloudinary } from '@/lib/cloudinary-server';

const cloudinary = getCloudinary();

export default async function handler(req, res) {
  const { data: imageData } = JSON.parse(req.body);

  const results = await cloudinary.uploader.upload(imageData, {
    folder: 'imagecarbon'
  });

  const data = ['public_id', 'secure_url', 'width', 'height'].reduce((prev, key) => {
    prev[key] = results[key];
    return prev;
  }, {})

  res.status(200).json({ data });
}
