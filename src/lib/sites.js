import { getXataClient } from '@/lib/xata';
import { cleanUrl } from '@/lib/util';

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