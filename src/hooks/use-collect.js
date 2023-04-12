import { useState, useEffect } from 'react';

import { addNumbers } from '@/lib/util';
import { collectImageStats, addSite, getCache } from '@/lib/sites';
import { scrapeImagesFromWebsite } from '@/lib/scraping';

export default function useCollect({ siteUrl }) {
  const [siteImages, setSiteImages] = useState();
  const [dateCollected, setDateCollected] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState(false);


  useEffect(() => {
    if ( !siteUrl ) {
      setSiteImages(undefined);
      setDateCollected(undefined);
      setIsLoading(false);
      setIsComplete(false);
      setError(false);
      return;
    }

    (async function run() {
      console.log(`[Collect] Begin scraping ${siteUrl}...`);

      setIsLoading(true);

      try {
          // Default the cache loading state to true so we don't show the site until we know it's cached

        const { images: cacheImages, dateCollected: cacheDateCollected } = await getCache({ siteUrl });

        if ( cacheImages ) {
          console.log(`[Collect] Cache found! Restoring ${cacheImages.length} images.`)

          const images = cacheImages.map(image => {
            return {
              ...image,
              optimized: JSON.parse(image.optimized),
              original: JSON.parse(image.original),
              uploaded: JSON.parse(image.uploaded)
            }
          });

          setSiteImages(images);
          setDateCollected(cacheDateCollected);
          setIsComplete(true);
          setIsLoading(false);

          return;
        }

        setIsLoading(true);

        // First grab all of the images from the passed in URL

        let { images } = await scrapeImagesFromWebsite({
          siteUrl
        });

        console.log(`[Collect] Found ${images?.length} images.`)

        images = images.map(image => {
          return {
            original: {
              url: image.url
            }
          };
        });

        setSiteImages(images);

        const { images: imagesResults } = await collectImageStats({
          images: images.map(({ original }) => original.url),
          siteUrl
        });

        console.log(`[Collect] Collected image data and emissions results.`)

        setDateCollected('Just Now');
        setSiteImages(imagesResults);
        setIsComplete(true);

        setIsLoading(false);

        await addSite({
          images: imagesResults,
          siteUrl
        });

        console.log(`[Collect] Added site to cache for next time!`)
      } catch(e) {
        setError(e.message);
        console.log(`[Collect] Something went wrong! ${e.message}`);
      }
    })();

    return () => {
      setSiteImages(undefined);
      setDateCollected(undefined);
      setIsLoading(undefined);
      setIsComplete(undefined);
      setError(undefined);
    }
  }, [siteUrl]);

  return {
    error,
    isLoading,
    isComplete,
    dateCollected,
    siteImages,
  }

}