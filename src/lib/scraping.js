import { scrapingBeeRequest } from '@/lib/scrapingbee';
import { log } from '@/lib/log';

/**
 * scrapeImagesFromWebsite
 */

export async function scrapeImagesFromWebsite({ siteUrl }) {
  const { images, error } = await fetch('/api/scrape', {
    method: 'POST',
    body: JSON.stringify({
      siteUrl
    })
  }).then(r => r.json());
    
  if ( error ) {
    log(`[scrapeImagesFromWebsite] ${error}`);
    throw new Error(error);
  }

  return { images };
}

export async function findSiteImagesByUrl(url) {
  const { error, images } = await scrapingBeeRequest({
    url,
    extractRules: {
      images: {
        selector: 'img',
        type: 'list',
        output: {
          src: 'img@src',
          loading: 'img@loading',
        }
      }
    }
  });
  
  if ( error ) {
    throw new Error(error);
  }

  return images?.filter(({ src }) => !!src)
    .filter(({ src }) => !src.includes('data:image/'));
}