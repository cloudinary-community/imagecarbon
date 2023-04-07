import { useState, useEffect } from 'react';
import useSWR from 'swr';

import { addNumbers } from '@/lib/util';
import { scrapeImagesFromWebsite } from '@/lib/scraping';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function useCollect({ siteUrl }) {
  // Default the cache loading state to true so we don't show the site until we know it's cached
  const { data: cacheData, error: cacheError, isLoading: cacheIsLoading = true } = useSWR(`/api/sites/cache?url=${siteUrl}`, fetcher);

  const [siteImages, setSiteImages] = useState();
  const [dateCollected, setDateCollected] = useState();
  // Default the loading state to true as the first action the page will take is the scrape
  // if not cached
  const [scrapeIsLoading, setScrapeIsLoading] = useState(true);
  const [scrapeComplete, setScrapeComplete] = useState(false);
  const [error, setError] = useState();

  // Total number of bytes the original images weigh

  const totalBytesOriginal = siteImages && scrapeComplete ? addNumbers(siteImages?.map(({ original }) => original?.size)) : undefined;
  const totalBytesOptimized = siteImages && scrapeComplete ? addNumbers(siteImages?.map(({ optimized }) => optimized?.size)) : undefined;

  // Estimated emissions

  const totalCo2Original = siteImages && scrapeComplete ? addNumbers(siteImages?.map(({ original }) => original.co2)) : undefined;
  const totalCo2Optimized = siteImages && scrapeComplete ? addNumbers(siteImages?.map(({ optimized }) => optimized.co2)) : undefined;
  const totalCo2Savings = totalCo2Original && totalCo2Optimized && Math.ceil(100 - (totalCo2Optimized / totalCo2Original * 100));
  

  useEffect(() => {
    if ( typeof cacheData === 'undefined' && !cacheError ) return;

    setError(false);

    console.log(`Begin scraping ${siteUrl}...`);

    if ( cacheData.images ) {
      console.log(`Cache found! Restoring ${cacheData.images.length} images.`)

      const images = cacheData.images.map(image => {
        return {
          ...image,
          optimized: JSON.parse(image.optimized),
          original: JSON.parse(image.original),
          uploaded: JSON.parse(image.uploaded)
        }
      });
      
      setSiteImages(images);
      setDateCollected(cacheData.dateCollected);
      setScrapeComplete(true);
      setScrapeIsLoading(false);

      return;
    }

    (async function run() {
      try {
        setScrapeIsLoading(true);

        // First grab all of the images from the passed in URL

        let { images } = await scrapeImagesFromWebsite({
          siteUrl
        });

        console.log(`Found ${images?.length} images.`)

        images = images.map(image => {
          return {
            original: {
              url: image.url
            }
          };
        });

        setSiteImages(images);

        const { images: imagesResults } = await fetch('/api/collect', {
          method: 'POST',
          body: JSON.stringify({
            images: images.map(({ original }) => original.url),
            siteUrl
          })
        }).then(r => r.json());

        console.log(`Collected image data and emissions results.`)

        setDateCollected('Just Now');
        setSiteImages(imagesResults);
        setScrapeComplete(true);

        setScrapeIsLoading(false);

        await fetch('/api/sites/add', {
          method: 'POST',
          body: JSON.stringify({
            images: imagesResults,
            siteUrl
          })
        }).then(r => r.json());

        console.log(`Added site to cache for next time!`)
      } catch(e) {
        setError(e.message);
        console.log(`Something went wrong! ${e.message}`);
      }
    })();
  }, [cacheData]);

  return {
    error,
    isLoading: scrapeIsLoading || cacheIsLoading,
    dateCollected,
    siteImages,
    totalBytesOptimized,
    totalBytesOriginal,
    totalCo2Optimized,
    totalCo2Original,
    totalCo2Savings,
  }

}