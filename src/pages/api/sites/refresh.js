import { cleanUrl } from '@/lib/util';
import { clearCache } from '@/lib/sites-server';

export default async function handler(req, res) {
  const siteUrl = cleanUrl(req.query.url);
  try {
    await clearCache({ siteUrl });
    res.status(200).json({
      message: '👍'
    });
  } catch(e) {
    console.log(`[${siteUrl}] Failed to clear cache: ${e.message}`);
    res.status(500).json({
      error: e.message
    })
  }
}

