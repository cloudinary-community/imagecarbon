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