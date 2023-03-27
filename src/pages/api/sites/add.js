import { getXataClient } from '@/lib/xata';

import { cleanUrl } from '@/lib/util';

const xata = getXataClient();

export default async function handler(req, res) {
  try {
    const body = JSON.parse(req.body);
    const { images } = body;
    const siteUrl = cleanUrl(body.siteUrl);

    // Look up to see if the site exists in the table
    
    const records = await xata.search.all(siteUrl, {
      tables: [
        { table: "Sites", target: [{ column: "siteUrl" }] },
      ],
      fuzziness: 0
    });

    const site = records?.[0].record;

    // If it does, first clear all existing images being stored with it

    const existingImages = await xata.db.Images.filter({
      siteUrl
    }).getMany();

    const existingImageIds = existingImages.map(({ id }) => id);

    await xata.db.Images.delete(existingImageIds);

    // Then collect the new images to be stored

    const imageRecords = images.map(image => {
      return {
        width: image.width,
        height: image.height,
        optimized: JSON.stringify(image.optimized),
        original: JSON.stringify(image.original),
        uploaded: JSON.stringify(image.uploaded),
        siteUrl,
      }
    });

    await xata.db.Images.create(imageRecords);

    // Finally, we want to add the site or update the date collection reference

    const dateCollected = new Date(Date.now()).toISOString()

    if ( site ) {
      // If the site exists, we just want to update the Date Collected record
      await xata.db.Sites.update(site.id, {
        siteUrl,
        dateCollected,
      });
    } else {
      // Otherwise we want to create the site
      await xata.db.Sites.create({
        siteUrl,
        dateCollected
      });
    }

    res.status(200).json({
      images
    });
  } catch(e) {
    console.log('e', e)
    console.log(`Failed to collect image assets: ${e.message}`);
    res.status(500).json({
      error: e.message
    })
  }
}

