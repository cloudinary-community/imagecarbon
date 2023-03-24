import { scrapingBeeRequest } from '@/lib/scrapingbee';

export default async function handler(req, res) {
  const { siteUrl } = JSON.parse(req.body);

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

  const images = results?.images && await Promise.all(results.images.map(async (image) => {
    const { src, loading } = image;

    let url = src;

    if ( !url.startsWith('http') ) {
      if ( !url.startsWith('/') ) {
        url = `/${url}`;
      }
      url = `${siteUrl}${url}`;
    }

    const imageResponse = await fetch(url);
    const { size } = await imageResponse.blob();

    return {
      url,
      size,
      loading
    }
  }));

  res.status(200).json({
    images
  })
}
