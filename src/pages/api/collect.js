import pLimit from 'p-limit';
import { co2, hosting } from '@tgwf/co2';
import { getCldImageUrl } from 'next-cloudinary';

import { getCloudinary } from '@/lib/cloudinary-server';
import { cleanUrl, getFileSize } from '@/lib/util';
import { isCloudinaryUrl } from '@/lib/cloudinary';

const cloudinary = getCloudinary();
const emissions = new co2({ model: 'swd' });

const OPTIMIZED_FORMAT = 'avif';

const limit = pLimit(10);

export default async function handler(req, res) {
  const body = JSON.parse(req.body);
  const { images, siteUrl } = body;
  const cleanSiteUrl = cleanUrl(body.siteUrl);

  console.log(`[Collect] Collecting data for ${cleanSiteUrl} with ${images.length} images`);

  const imagesToUpload = images.map(image => {
    // Because we're using AVIF as our optimization model, we want to make sure we're comparing
    // the same thing between original and optimized. Because f_auto will serve AVIF whereever
    // possible, we assume and force a format of f_avif otherwise because we're not making
    // a browser request, it may not return the image results in avif format

    if ( isCloudinaryUrl(image?.url) ) {
      image.url = image.url.replace('f_auto', 'f_avif')
    }

    return image;
  });

  try {
    const imagesQueue = imagesToUpload.map(({ url, ...image }) => {
      return limit(() => {
        async function upload() {
          try {
            const results = await cloudinary.uploader.upload(url, {
              folder: 'imagecarbon',
              tags: ['imagecarbon', `imagecarbon:site:${cleanSiteUrl}`, 'imagecarbon:upload'],
              context: {
                siteUrl,
                originalUrl: url
              }
            });
            return {
              ...image,
              upload: results
            }
          } catch(e) {
            console.log(`[${cleanSiteUrl}] Failed to upload image ${url}: ${e.message || e.code || e.error.code}`);
            return;
          }
        };
        return upload();
      });
    });


    let uploads = await Promise.all(imagesQueue);

    console.log(`[Collect] Uploads complete.`);

    // Filter out failed image upload requests

    uploads = uploads.filter(upload => !!upload?.upload);

    console.log(`[Collect] ${uploads.length} successful`);

    const hosts = {
      'res.cloudinary.com': await hosting.check('res.cloudinary.com')
    };

    const results = await Promise.all(uploads.map(async ({ upload, ...image }) => {
      const { originalUrl } = upload.context.custom;

      const host = new URL(originalUrl)?.host;

      if ( typeof hosts[host] === 'undefined' ) {
        hosts[host] = await hosting.check(host);
      }

      const optimizedUrl = getCldImageUrl({
        src: upload.public_id,
        format: OPTIMIZED_FORMAT
      });

      const optimizedSize = await getFileSize(optimizedUrl);

      return {
        height: upload.height,
        width: upload.width,
        original: {
          format: upload.format,
          size: upload.bytes,
          url: originalUrl,
          co2: emissions.perVisit(upload.bytes, hosts[host]),
          ...image
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
      images: results,
    });
  } catch(e) {
    console.log(`[${cleanSiteUrl}] Failed to collect image assets: ${e.message}`);
    res.status(500).json({
      error: e.message
    })
  }
}
