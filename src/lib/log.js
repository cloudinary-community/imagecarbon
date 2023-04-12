export function log() {
  if ( process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_IMAGECARBON_DEV === 'true' ) {
    console.log.apply(null, arguments);
  }
}