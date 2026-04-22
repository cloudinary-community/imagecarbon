import { getSupabaseAdmin } from '@/lib/supabase-server';
import { cleanUrl } from '@/lib/util';

import { SCRAPING_CACHE_TIME } from '@/data/scraping';

function mapSiteRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    siteUrl: row.site_url,
    dateCollected: row.date_collected ? new Date(row.date_collected) : null,
    screenshot: row.screenshot,
  };
}

function mapImageRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    siteUrl: row.site_url,
    optimized: row.optimized,
    original: row.original,
    uploaded: row.uploaded,
    width: row.width,
    height: row.height,
  };
}

function throwOnError(result, context) {
  if (result.error) {
    throw new Error(`${context}: ${result.error.message}`);
  }
}

export async function getSites() {
  const supabase = getSupabaseAdmin();
  const result = await supabase.from('sites').select('*').order('date_collected', { ascending: false });
  throwOnError(result, 'getSites');
  return (result.data || []).map(mapSiteRow);
}

export async function getSiteByUrl(url) {
  const siteUrl = cleanUrl(url);
  const supabase = getSupabaseAdmin();
  const result = await supabase.from('sites').select('*').eq('site_url', siteUrl).maybeSingle();
  throwOnError(result, 'getSiteByUrl');
  return mapSiteRow(result.data);
}

export async function updateSiteById(id, data) {
  const supabase = getSupabaseAdmin();
  const payload = {};
  if (data.siteUrl !== undefined) payload.site_url = data.siteUrl;
  if (data.dateCollected !== undefined) {
    payload.date_collected =
      data.dateCollected instanceof Date
        ? data.dateCollected.toISOString()
        : data.dateCollected;
  }
  if (data.screenshot !== undefined) payload.screenshot = data.screenshot;

  const result = await supabase.from('sites').update(payload).eq('id', id).select('*').single();
  throwOnError(result, 'updateSiteById');
  return mapSiteRow(result.data);
}

export async function createSite(data) {
  const supabase = getSupabaseAdmin();
  const result = await supabase
    .from('sites')
    .insert({
      site_url: data.siteUrl,
      date_collected:
        data.dateCollected instanceof Date
          ? data.dateCollected.toISOString()
          : data.dateCollected,
      screenshot: data.screenshot ?? null,
    })
    .select('*')
    .single();
  throwOnError(result, 'createSite');
  return mapSiteRow(result.data);
}

export async function deleteSiteById(id) {
  const supabase = getSupabaseAdmin();
  const result = await supabase.from('sites').delete().eq('id', id);
  throwOnError(result, 'deleteSiteById');
}

export async function getImagesBySiteUrl(url) {
  const siteUrl = cleanUrl(url);
  const supabase = getSupabaseAdmin();
  const result = await supabase.from('images').select('*').eq('site_url', siteUrl);
  throwOnError(result, 'getImagesBySiteUrl');
  return (result.data || []).map(mapImageRow);
}

export async function deleteImagesById(ids) {
  if (!ids?.length) return;
  const supabase = getSupabaseAdmin();
  const result = await supabase.from('images').delete().in('id', ids);
  throwOnError(result, 'deleteImagesById');
}

export async function addImages(images) {
  if (!images?.length) return [];
  const supabase = getSupabaseAdmin();
  const rows = images.map((img) => ({
    site_url: img.siteUrl,
    optimized: img.optimized,
    original: img.original,
    uploaded: img.uploaded,
    width: img.width ?? null,
    height: img.height ?? null,
  }));
  const result = await supabase.from('images').insert(rows).select('*');
  throwOnError(result, 'addImages');
  return (result.data || []).map(mapImageRow);
}

/**
 * getCache
 */

export async function getCache({ siteUrl: url }) {
  const siteUrl = cleanUrl(url);

  const site = await getSiteByUrl(siteUrl);
  const { dateCollected, screenshot } = site || {};

  const shouldRefresh =
    dateCollected &&
    new Date(Date.now()) > new Date(dateCollected).getTime() + SCRAPING_CACHE_TIME;

  if (!dateCollected || shouldRefresh) {
    return {};
  }

  const images = await getImagesBySiteUrl(siteUrl);

  return {
    dateCollected,
    images,
    screenshot,
  };
}

/**
 * clearCache
 */

export async function clearCache({ siteUrl: url }) {
  const siteUrl = cleanUrl(url);

  const site = await getSiteByUrl(siteUrl);
  if (!site) return true;

  const existingImages = await getImagesBySiteUrl(siteUrl);
  const existingImageIds = existingImages.map(({ id }) => id);

  if (existingImageIds.length) {
    await deleteImagesById(existingImageIds);
  }
  await deleteSiteById(site.id);

  return true;
}
