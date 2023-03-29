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

/**
 * addNumbers
 */

export function addNumbers(sizes = []) {
  return sizes.reduce((prev, curr) => prev + curr, 0);
}

/**
 * deduplicateArrayByKey
 * @via Thanks ChatGPT + tweaks
 */

export function deduplicateArrayByKey(arr, key) {
  if ( !Array.isArray(arr) ) return arr;
  
  const seen = new Set(); // to keep track of seen keys

  return arr.filter((item) => {
    let value = item[key];

    if ( typeof key === 'function' ){
      value = key(item);
    }
    
    if (seen.has(value)) {
      return false; // skip this item if the key has already been seen
    } else {
      seen.add(value); // mark this key as seen
      return true; // include this item in the filtered array
    }
  });
}

/**
 * isValidUrl
 */

export function isValidUrl(string) {
  try {
    const url = new URL(string);

    if ( !url.host.split('.')[1] ) {
      throw new Error();
    }

    return true;
  } catch(e) {
    return false;
  }
}