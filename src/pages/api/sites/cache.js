import { getXataClient } from '@/lib/xata';

import { cleanUrl } from '@/lib/util';
import { SCRAPING_CACHE_TIME } from '@/data/scraping';

const xata = getXataClient();

export default async function handler(req, res) {
  try {
    const siteUrl = cleanUrl(req.query.url);

    const records = await xata.search.all(siteUrl, {
      tables: [
        { table: "Sites", target: [{ column: "siteUrl" }] },
      ],
      fuzziness: 0
    });

    const site = records?.[0]?.record;
    const shouldRefresh = site && new Date(Date.now()) > new Date(site.dateCollected).getTime() + SCRAPING_CACHE_TIME;

    if ( !site || shouldRefresh ) {
      res.status(200).json({});
      return;
    }

    const images = await xata.db.Images.filter({
      siteUrl
    }).getMany();

    res.status(200).json({
      images
    });
  } catch(e) {
    console.log(`Failed to get cache: ${e.message}`);
    res.status(500).json({
      error: e.message
    })
  }
}

