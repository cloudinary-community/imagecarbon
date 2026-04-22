import { log } from '@/lib/log';

/**
 * scrapeImagesFromWebsite
 */

export async function scrapeImagesFromWebsite({ siteUrl }) {
  const res = await fetch('/api/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      siteUrl,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.error || `Scrape failed (${res.status})`;
    log(`[scrapeImagesFromWebsite] ${message}`);
    throw new Error(message);
  }

  if (data.error) {
    log(`[scrapeImagesFromWebsite] ${data.error}`);
    throw new Error(data.error);
  }

  return { images: data.images };
}
