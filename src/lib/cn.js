/** Join class names, skipping falsy entries. */
export function cn(...parts) {
  return parts.flat().filter(Boolean).join(' ');
}
