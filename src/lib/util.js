/**
 * cleanUrl
 */

export function cleanUrl(url, { removeQueryParams = false } = {}) {
  if ( typeof url !== 'string' ) return url;

  if ( removeQueryParams ) {
    url = url.split('?')[0];
  }

  return url.toLowerCase().replace(/http?s:\/\//, '').replace(/\/$/, '')
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


/**
 * addCommas
 * @via Thanks ChatGPT
 */

export function addCommas(number) {
  if ( !['string', 'number'].includes(typeof number) ) return number;

  const num = `${number}`;
  const [whole, decimal] = num.split('.');
  let digits = whole.split('');
  let counter = 0;

  // Iterate through the digits from right to left
  for (var i = digits.length - 1; i >= 0; i--) {
    // Increment the counter
    counter++;

    // If the counter is a multiple of 3 and we're not at the leftmost digit, add a comma
    if (counter % 3 === 0 && i !== 0) {
      digits.splice(i, 0, ",");
    }
  }

  digits = digits.join('');

  if ( decimal ) {
    digits = `${digits}.${decimal}`;
  }

  return digits;
}

/**
 * trimString
 */

export function trimString({ string, maxLength, ellipsis = true}) {
  if ( typeof string !== 'string' || string.length <= maxLength ) return string;
  const trimmed = string.split('').slice(0, ellipsis ? maxLength - 3 : maxLength).join('');
  return ellipsis ? `${trimmed}...` : trimmed;
}

/**
 * formatGrams
 */

const defaultFixed = 1;
const maxAutoFixed = 4;

export function formatGrams(grams, { type = 'g', limit, fixed = defaultFixed, commas = true } = {}) {
  let placesToFix = fixed === 'auto' ? defaultFixed : fixed;
  let amount = grams;
  let fixedAmount;

  if ( typeof amount !== 'number' ) return amount;

  if ( limit && amount >= limit ) {
    type = 'kg';
  }

  if ( type === 'kg' ) {
    amount = amount / 1000;
  }

  if ( placesToFix > 0 && amount % 1 !== 0 ) {
    fixedAmount = amount.toFixed(placesToFix)
  } else {
    fixedAmount = `${amount}`;
  }

  const fixedSplit = fixedAmount.split('.');

  if ( fixed === 'auto' && fixedSplit[0] === '0' && fixedSplit[1] ) {
    while ( fixedAmount.split('.')[1].split('').filter(num => num !== '0').length === 0 ) {
      placesToFix = placesToFix + 1;
      fixedAmount = amount.toFixed(placesToFix);
      if ( placesToFix === maxAutoFixed ) break;
    }
  }
  

  if ( commas ) {
    fixedAmount = addCommas(fixedAmount);
  }

  return `${fixedAmount}${type}`;
}

/**
 * formatBytes
 */

export function formatBytes(grams, { type = 'kb', limit, fixed = 0, commas = true } = {}) {
  let amount = grams;

  if ( typeof amount !== 'number' ) return amount;

  if ( limit && amount >= 1000000 ) {
    type = 'gb'
  } else if ( limit && amount >= limit * 1000 ) {
    type = 'mb';
  } else if ( limit && amount >= limit ) {
    type = 'kb';
  }

  if ( type === 'gb' ) {
    amount = amount / 1000000000;
  } else if ( type === 'mb' ) {
    amount = amount / 1000000;
  } else if ( type === 'kb' ) {
    amount = amount / 1000;
  }

  if ( fixed > 0 && amount % 1 !== 0 ) {
    amount = amount.toFixed(fixed)
  } else if ( fixed === 0 ) {
    amount = Math.ceil(amount);
  }

  if ( commas ) {
    amount = addCommas(amount);
  }

  return `${amount}${type}`;
}