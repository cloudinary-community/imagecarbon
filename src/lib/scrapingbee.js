/**
 * scrapingBeeRequest
 */

export async function scrapingBeeRequest({ url, extractRules }) {
  const params = {
    api_key: process.env.SCRAPINGBEE_API_KEY,
    url,
    extract_rules: JSON.stringify(),
    wait: '1000'
  };

  if ( extractRules) {
    params.extract_rules = JSON.stringify(extractRules);
  }

  const paramsString = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');

  const results = await fetch(`https://app.scrapingbee.com/api/v1?${paramsString}`).then(r => r.text());

  let data = results;

  try {
    data = JSON.parse(data);
  } catch(e) {}

  return data;
}