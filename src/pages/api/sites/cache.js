import { cleanUrl } from '@/lib/util';
import { getCache } from '@/lib/sites-server';

export default async function handler(req, res) {
  const siteUrl = cleanUrl(req.query.url);
  try {
    const cache = await getCache({ siteUrl });
    res.status(200).json(cache);
  } catch(e) {
    console.log(`[${siteUrl}] Failed to get cache: ${e.message}`);
    res.status(500).json({
      error: e.message
    })
  }
}

