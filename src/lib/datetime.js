export function formatDate(dateString) {
  const date = new Date(dateString);
  
  if ( date.toString() === 'Invalid Date' ) {
    return dateString;
  }

  return date.toLocaleString();
}