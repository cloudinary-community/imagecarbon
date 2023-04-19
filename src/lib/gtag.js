export const GA_TRACKING_ID = process.env.NODE_ENV !== 'development' && 'G-9LH8W25SXT';

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url) => {
  if ( !NEXT_PUBLIC_GA_ID ) return;
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  })
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }) => {
  if ( !NEXT_PUBLIC_GA_ID ) return;
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}