import { findSiteImagesByUrl } from '@/lib/scraping';
import { cleanUrl, restoreUrl } from '@/lib/util';

export const config = {
  runtime: 'edge',
}

const SCRAPING_TIMEOUT = 30 * 1000; // 30 seconds

export default async function handler(res) {
	const { siteUrl } = await res.json();

  try {
    let images;

    try {
      const results = await Promise.race([
        findSiteImagesByUrl(siteUrl),
        new Promise((resolve) => {
          setTimeout(() => resolve(false), SCRAPING_TIMEOUT);
        })
      ]);

      if ( !results ) {
        throw new Error('Scraping timed out');
      }

      images = results;
    } catch(e) {
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

      const host = restoreUrl(cleanUrl(siteUrl, { removeQueryParams: true }));
      let url = src;

      if ( !url.startsWith('http') ) {
        if ( !url.startsWith('/') ) {
          url = `/${url}`;
        }
        url = `${host}${url}`;
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
    console.log(`[${cleanUrl(siteUrl)}] Failed to scrape website: ${e.message}`);
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
