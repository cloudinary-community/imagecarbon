import pLimit from 'p-limit';
import { co2, hosting } from '@tgwf/co2';
import { constructCloudinaryUrl } from '@cloudinary-util/url-loader';

import { getCloudinary } from '@/lib/cloudinary-server';
import { cleanUrl, getFileSize } from '@/lib/util';
import { isCloudinaryUrl } from '@/lib/cloudinary';

const cloudinary = getCloudinary();
const emissions = new co2({ model: 'swd' });

const OPTIMIZED_FORMAT = 'avif';

const limit = pLimit(10);

export default async function handler(req, res) {
  const body = JSON.parse(req.body);
  const { images } = body;
  const siteUrl = cleanUrl(body.siteUrl);

  console.log(`[Collect] Collecting data for ${siteUrl} with ${images.length} images`);

  const imageUrls = images.map(image => {
    // Because we're using AVIF as our optimization model, we want to make sure we're comparing
    // the same thing between original and optimized. Because f_auto will serve AVIF whereever
    // possible, we assume and force a format of f_avif otherwise because we're not making
    // a browser request, it may not return the image results in avif format

    if ( isCloudinaryUrl(image) ) {
      return image.replace('f_auto', 'f_avif');
    }
    return image;
  });

  try {
    const imagesQueue = imageUrls.map(image => {
      return limit(() => {
        async function upload() {
          try {
            const results = await cloudinary.uploader.upload(image, {
              folder: 'imagecarbon',
              tags: ['imagecarbon', `imagecarbon:site:${siteUrl}`],
              context: {
                siteUrl,
                originalUrl: image
              }
            });
            return results;
          } catch(e) {
            console.log(`[${siteUrl}] Failed to upload image ${image}: ${e.message}`);
            return;
          }
        };
        return upload();
      });
    });


    let uploads = await Promise.all(imagesQueue);
    
    console.log(`[Collect] Uploads complete.`);
    
    // Filter out failed image upload requests

    uploads = uploads.filter(upload => !!upload);

    console.log(`[Collect] ${uploads.length} successful uploads.`);

    const hosts = {
      'res.cloudinary.com': await hosting.check('res.cloudinary.com')
    };

    const results = await Promise.all(uploads.map(async (upload) => {
      const { originalUrl } = upload.context.custom;

      const host = cleanUrl(originalUrl).split('/')?.[0];

      if ( typeof hosts[host] === 'undefined' ) {
        hosts[host] = await hosting.check(host);
      }

      const optimizedUrl = constructCloudinaryUrl({
        options: {
          src: upload.public_id,
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
        height: upload.height,
        width: upload.width,
        original: {
          format: upload.format,
          size: upload.bytes,
          url: originalUrl,
          co2: emissions.perVisit(upload.bytes, hosts[host])
        },
        uploaded: {
          url: upload.secure_url,
          publicId: upload.public_id,
        },
        optimized: {
          format: OPTIMIZED_FORMAT,
          url: optimizedUrl,
          size: optimizedSize,
          co2: emissions.perVisit(optimizedSize, hosts['res.cloudinary.com'])
        }
      }
    }));

    res.status(200).json({
      siteUrl,
      date: new Date(Date.now()).toISOString(),
      images: results
    });
  } catch(e) {
    console.log(`[${siteUrl}] Failed to collect image assets: ${e.message}`);
    res.status(500).json({
      error: e.message
    })
  }
}
