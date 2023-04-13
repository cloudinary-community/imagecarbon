import { findSiteImagesByUrl } from '@/lib/scraping';
import { cleanUrl } from '@/lib/util';
import { getCldImageUrl } from 'next-cloudinary';

export const config = {
  runtime: 'edge',
}

const SCRAPING_TIMEOUT = 30 * 1000; // 30 seconds

export default async function handler(res) {
	const { siteUrl } = await res.json();
  const cleanSiteUrl = cleanUrl(siteUrl);

  try {
    let images;

    try {
      const results = await Promise.race([
        findSiteImagesByUrl(siteUrl),
        new Promise((resolve) => {
          setTimeout(() => resolve('SCRAPING_TIMEOUT'), SCRAPING_TIMEOUT);
        })
      ]);

      if ( !results ) {
        console.log(`[${cleanSiteUrl}][Scrape] No results found.`);
        throw new Error('No results found');
      } else if ( results === 'SCRAPING_TIMEOUT' ) {
        console.log(`[${cleanSiteUrl}][Scrape] Timed out.`);
        throw new Error('Scraping timed out');
      }

      images = results;

      console.log(`[${cleanSiteUrl}][Scrape] ${images.length} images found.`);
    } catch(e) {
      console.log(`[${cleanSiteUrl}][Scrape] Error: ${e.message}`, e);
      if ( e.message.includes('If you wish to scrape') ) {
        throw new Error('This website does not allow scraping');
      } else if ( e.message.includes('Scraping timed out') ) {
        throw new Error('We had trouble connecting to this website.');
      } else {
        throw e;
      }
    }

    images = images && await Promise.all(images.map(async (image) => {
      const { src, loading } = image;

      const host = new URL(siteUrl)?.host;
      let url = src;

      // ex: //domain.com...

      if ( url.startsWith('//') ) {
        url = `https${url}`;
      }

      if ( !url.startsWith('http') ) {
        if ( !url.startsWith('/') ) {
          url = `/${url}`;
        }
        url = `https://${host}${url}`;
      }

      return {
        url,
        loading
      }
    }));

    return new Response(
      JSON.stringify({
        images
      }),
      {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      }
    );
  } catch(e) {
    console.log(`[${cleanSiteUrl}][Scrape] Failed to scrape website: ${e.message}`);
    return new Response(
      JSON.stringify({
        error: e.message
      }),
      {
        status: 500,
        headers: {
          'content-type': 'application/json',
        },
      }
    );
  }
}
