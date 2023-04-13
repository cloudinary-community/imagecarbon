import { getXataClient } from '@/lib/xata';
import { cleanUrl } from '@/lib/util';

import { SCRAPING_CACHE_TIME } from '@/data/scraping';

const xata = getXataClient();

export async function getSites() {
  return xata.db.Sites.getAll();
}

export async function getSiteByUrl(url) {
  const siteUrl = cleanUrl(url);
  return xata.db.Sites.filter({ siteUrl }).getFirst();
}

export async function updateSiteById(id, data) {
  return xata.db.Sites.update(id, data);
}

export async function createSite(data) {
  return xata.db.Sites.create(data);
}

export async function getImagesBySiteUrl(url) {
  const siteUrl = cleanUrl(url);
  return xata.db.Images.filter({ siteUrl }).getAll();
}

export async function deleteImagesById(ids) {
  return xata.db.Images.delete(ids);
}

export async function addImages(images) {
  return xata.db.Images.create(images);
}

/**
 * getCache
 */

export async function getCache({ siteUrl: url }) {
  const siteUrl = cleanUrl(url);

  const { dateCollected , screenshot} = await getSiteByUrl(siteUrl) || {};

  const shouldRefresh = dateCollected && new Date(Date.now()) > new Date(dateCollected).getTime() + SCRAPING_CACHE_TIME;

  if ( !dateCollected || shouldRefresh ) {
    return {};
  }

  const images = await getImagesBySiteUrl(siteUrl);

  return {
    dateCollected,
    images,
    screenshot
  }
}