import { findSiteImagesByUrl } from '@/lib/scraping';
import { cleanUrl } from '@/lib/util';

export const config = {
  runtime: 'edge',
}

export default async function handler(res) {
	const { siteUrl } = await res.json();

  try {
    let images;

    try {
      images = await findSiteImagesByUrl(siteUrl);
    } catch(e) {
      if ( e.message.includes('If you wish to scrape') ) {
        throw new Error('This website does not allow scraping');
      }
    }

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
