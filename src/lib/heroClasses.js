/** Hero sections: blurred glow + conic accent (ported from legacy SCSS). */

export const HERO_GLOW =
  'relative flex min-h-[calc(100vh-3rem)] items-center p-0 sm:min-h-[calc(100vh-4rem)] before:pointer-events-none before:absolute before:inset-0 before:z-0 before:m-auto before:h-[120vh] before:w-[120vw] before:rounded-full before:bg-[radial-gradient(ellipse_at_center,#E9EDE0,#333533)] before:opacity-15 before:blur-[80px] before:content-[""] before:[transform:translateZ(0)] after:pointer-events-none after:absolute after:inset-0 after:z-0 after:m-auto after:h-[66vh] after:w-screen after:opacity-60 after:blur-[80px] after:content-[""] after:[transform:translateZ(0)] after:[background:conic-gradient(from_180deg_at_50%_50%,#EECC6E_0deg,transparent_60deg,transparent_360deg)]';

/** Scanning state on `/site` — animated conic ring. */
export const HERO_GLOW_LOADING =
  'relative flex min-h-[calc(100vh-3rem)] items-center p-0 sm:min-h-[calc(100vh-4rem)] before:pointer-events-none before:absolute before:inset-0 before:z-0 before:m-auto before:h-[120vh] before:w-[120vw] before:rounded-full before:bg-[radial-gradient(ellipse_at_center,#E9EDE0,#333533)] before:opacity-15 before:blur-[80px] before:content-[""] before:[transform:translateZ(0)] after:pointer-events-none after:absolute after:inset-0 after:z-0 after:m-auto after:h-[66vh] after:w-screen after:opacity-40 after:blur-[80px] after:content-[""] after:[transform:translateZ(0)] after:animate-spin-grow after:[background:conic-gradient(from_180deg_at_50%_50%,transparent_0deg,#EECC6E_60deg,transparent_220deg,#EECC6E_270deg,transparent_360deg)]';

export const HERO_INNER = 'relative z-10 text-center';

export const HERO_INNER_PADDED = `${HERO_INNER} p-8`;
