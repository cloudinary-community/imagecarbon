import { scrapingBeeRequest } from '@/lib/scrapingbee';
import { cleanUrl } from '@/lib/util';

export const config = {
  runtime: 'edge',
}

export default async function handler(res) {
	const { siteUrl } = await res.json();

  try {
    const results = await scrapingBeeRequest({
      url: siteUrl,
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

    // Create an array of the images with a full URL and the size

    let images = results?.images
      .filter(({ src }) => !!src)
      .filter(({ src }) => !src.includes('data:image/'));

    images = images && await Promise.all(images.map(async (image) => {
      const { src, loading } = image;

      let url = src;

      if ( !url.startsWith('http') ) {
        if ( !url.startsWith('/') ) {
          url = `/${url}`;
        }
        url = `${siteUrl}${url}`;
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
