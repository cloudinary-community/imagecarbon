/**
 * collectImageStats
 */

export async function collectImageStats({ images, siteUrl }) {
  try {
    const results = await fetch('/api/collect', {
      method: 'POST',
      body: JSON.stringify({
        images,
        siteUrl
      })
    }).then(r => r.json());
    return results;
  } catch(e) {
    throw new Error(`Failed to add site: ${e.message}`);
  }
}

/**
 * addSite
 */

export async function addSite({ images, siteUrl }) {
  try {
    const results = await fetch('/api/sites/add', {
      method: 'POST',
      body: JSON.stringify({
        images,
        siteUrl
      })
    }).then(r => r.json());
    return results;
  } catch(e) {
    throw new Error(`Failed to add site: ${e.message}`);
  }
}

/**
 * getCache
 */

export async function getCache({ siteUrl }) {
  try {
    const results = await fetch(`/api/sites/cache?url=${siteUrl}`).then(r => r.json());
    return results;
  } catch(e) {
    throw new Error(`Failed get cache: ${e.message}`);
  }
}