/**
 * scrapeImagesFromWebsite
 */

export async function scrapeImagesFromWebsite({ siteUrl }) {
  const { images } = await fetch('/api/scrape', {
    method: 'POST',
    body: JSON.stringify({
      siteUrl
    })
  }).then(r => r.json());
  return { images };
}