import { Source_Sans_Pro } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';

import '@/styles/globals.scss';

const sourceSansPro = Source_Sans_Pro({
  weight: ['400', '600', '700', '900'],
  style: ['normal'],
  subsets: ['latin'],
});

export default function App({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${sourceSansPro.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}