import { co2, hosting } from '@tgwf/co2';

import { getCloudinary } from '@/lib/cloudinary-server';
import { cleanUrl, getFileSize } from '@/lib/util';
import { constructCloudinaryUrl } from '@cloudinary-util/url-loader';

const cloudinary = getCloudinary();
const emissions = new co2();

const OPTIMIZED_FORMAT = 'avif';

export default async function handler(req, res) {
  try {
    const { images, siteUrl } = JSON.parse(req.body);

    const uploads = [];

    for (const image of images) {
      const resource = await cloudinary.uploader.upload(image, {
        folder: 'imagecarbon',
        tags: ['imagecarbon', `imagecarbon:site:${siteUrl}`]
      });
      uploads.push({
        url: image,
        resource
      });
    }

    const hosts = {
      'res.cloudinary.com': await hosting.check('res.cloudinary.com')
    };


    const results = await Promise.all(uploads.map(async (upload) => {
      const host = cleanUrl(upload.url).split('/')?.[0];

      if ( typeof hosts[host] === 'undefined' ) {
        hosts[host] = await hosting.check(host);
      }

      const optimizedUrl = constructCloudinaryUrl({
        options: {
          src: upload.resource.public_id,
          format: OPTIMIZED_FORMAT
        },
        config: {
          cloud: {
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
          }
        }
      });

      const optimizedSize = await getFileSize(optimizedUrl);

      return {
        height: upload.resource.height,
        width: upload.resource.width,
        original: {
          format: upload.resource.format,
          size: upload.resource.bytes,
          url: upload.url,
          co2: emissions.perByte(upload.resource.bytes, hosts[host])
        },
        uploaded: {
          url: upload.resource.secure_url,
          publicId: upload.resource.public_id,
        },
        optimized: {
          format: OPTIMIZED_FORMAT,
          url: optimizedUrl,
          size: optimizedSize,
          co2: emissions.perByte(optimizedSize, hosts['res.cloudinary.com'])
        }
      }
    }));

    res.status(200).json({
      siteUrl,
      images: results
    });
  } catch(e) {
    console.log(`Failed to collect image assets: ${e.message}`);
    res.status(500).json({
      error: e.message
    })
  }
}
