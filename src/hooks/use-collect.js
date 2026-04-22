import { useState, useEffect } from 'react';

import { collectImageStats, addSite, getCache } from '@/lib/sites';
import { scrapeImagesFromWebsite } from '@/lib/scraping';
import { log } from '@/lib/log';

export default function useCollect({ siteUrl }) {
  const [siteImages, setSiteImages] = useState();
  const [dateCollected, setDateCollected] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    function safeSet(fn) {
      if (!cancelled) fn();
    }

    if (!siteUrl) {
      log('[Collect] no siteUrl, bail.');
      setSiteImages(undefined);
      setDateCollected(undefined);
      setIsLoading(false);
      setIsComplete(false);
      setError(false);
      return undefined;
    }

    (async function run() {
      log(`[Collect] Begin scraping ${siteUrl}...`);

      safeSet(() => {
        setIsLoading(true);
        setError(false);
        setIsComplete(false);
      });

      try {
        const { images: cacheImages, dateCollected: cacheDateCollected } = await getCache({ siteUrl });

        if (cancelled) return;

        if (cacheImages) {
          log(`[Collect] Cache found! Restoring ${cacheImages.length} images.`);

          const images = cacheImages.map((image) => ({
            ...image,
            optimized: JSON.parse(image.optimized),
            original: JSON.parse(image.original),
            uploaded: JSON.parse(image.uploaded)
          }));

          setSiteImages(images);
          setDateCollected(cacheDateCollected);
          setIsComplete(true);
          setIsLoading(false);

          return;
        }

        let { images } = await scrapeImagesFromWebsite({ siteUrl });

        if (cancelled) return;

        log(`[Collect] Found ${images?.length} images.`);

        images = images.map((image) => ({ original: image }));

        setSiteImages(images);

        const { images: imagesResults, screenshot } = await collectImageStats({
          images: images.map(({ original }) => original),
          siteUrl
        });

        if (cancelled) return;

        log('[Collect] Collected image data and emissions results.');

        setDateCollected('Just Now');
        setSiteImages(imagesResults);

        await addSite({
          images: imagesResults,
          siteUrl,
          screenshot
        });

        if (cancelled) return;

        setIsComplete(true);
        setIsLoading(false);

        log('[Collect] Added site to cache for next time!');
      } catch (e) {
        if (cancelled) return;
        setError(e.message);
        setIsLoading(false);
        setIsComplete(false);
        log(`[Collect] Something went wrong! ${e.message}`);
      }
    })();

    return () => {
      cancelled = true;
      log('[Collect] Effect cancelled (navigation or Strict Mode remount).');
    };
  }, [siteUrl]);

  return {
    error,
    isLoading,
    isComplete,
    dateCollected,
    siteImages
  };
}
