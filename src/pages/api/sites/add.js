import { cleanUrl } from '@/lib/util';
import { getSiteByUrl, updateSiteById, createSite, getImagesBySiteUrl, deleteImagesById, addImages } from '@/lib/sites';

export default async function handler(req, res) {
  const body = JSON.parse(req.body);
  const { images } = body;
  const siteUrl = cleanUrl(body.siteUrl);
  
  try {

    // Look up to see if the site exists in the table

    const site = await getSiteByUrl(siteUrl)

    // If it does, first clear all existing images being stored with it

    const existingImages = await getImagesBySiteUrl(siteUrl);

    const existingImageIds = existingImages.map(({ id }) => id);

    await deleteImagesById(existingImageIds);

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

    await addImages(imageRecords);

    // Finally, we want to add the site or update the date collection reference

    const dateCollected = new Date(Date.now()).toISOString()

    if ( site ) {
      // If the site exists, we just want to update the Date Collected record
      await updateSiteById(site.id, {
        siteUrl,
        dateCollected,
      });
    } else {
      // Otherwise we want to create the site
      await createSite({
        siteUrl,
        dateCollected
      });
    }

    res.status(200).json({
      images,
      dateCollected
    });
  } catch(e) {
    console.log(`[${siteUrl}] Failed to add site: ${e.message}`);
    res.status(500).json({
      error: e.message
    })
  }
}

