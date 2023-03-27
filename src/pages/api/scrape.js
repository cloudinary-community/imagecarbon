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

  res.status(200).json({
    images
  })
}
