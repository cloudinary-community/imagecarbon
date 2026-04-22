/**
 * collectImageStats
 */

export async function collectImageStats({ images, siteUrl }) {
  const res = await fetch('/api/collect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      images,
      siteUrl
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Collect failed (${res.status})`);
  }
  return data;
}

/**
 * addSite
 */

export async function addSite({ images, siteUrl, screenshot }) {
  const res = await fetch('/api/sites/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      images,
      siteUrl,
      screenshot
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Save site failed (${res.status})`);
  }
  return data;
}

/**
 * getCache
 */

export async function getCache({ siteUrl }) {
  const encoded = encodeURIComponent(siteUrl);
  const res = await fetch(`/api/sites/cache?url=${encoded}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Cache lookup failed (${res.status})`);
  }
  return data;
}

/**
 * clearCache
 */

export async function clearCache({ siteUrl }) {
  const encoded = encodeURIComponent(siteUrl);
  const res = await fetch(`/api/sites/refresh?url=${encoded}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Refresh failed (${res.status})`);
  }
  return data;
}