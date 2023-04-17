import { useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { Source_Sans_Pro } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import * as gtag from '@/lib/gtag';

import '@/styles/globals.scss';

const sourceSansPro = Source_Sans_Pro({
  weight: ['400', '600', '700', '900'],
  style: ['normal'],
  subsets: ['latin'],
});

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => gtag.pageview(url);
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${sourceSansPro.style.fontFamily};
        }
      `}</style>
      <Head>
        {gtag.GA_TRACKING_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gtag.GA_TRACKING_ID}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        )}
      </Head>
      {gtag.GA_TRACKING_ID && (
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
        />
      )}
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}