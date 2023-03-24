/**
 * cleanUrl
 */

export function cleanUrl(url) {
  if ( typeof url !== 'string' ) return url;
  return url.replace(/http?s:\/\//, '').replace(/\/$/, '')
}

/**
 * restoreUrl
 */

export function restoreUrl(url) {
  if ( typeof url !== 'string' ) return url;
  if ( !url.startsWith('http') ) {
    url = `https://${url}`;
  }
  return url;
}

/**
 * getFileSize
 */

export async function getFileSize(url) {
  const data = await fetch(url).then(r => r.blob());
  return data.size;
}