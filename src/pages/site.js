import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { cleanUrl, restoreUrl } from '@/lib/util';
import { log } from '@/lib/log';

import useCollect from '@/hooks/use-collect';

import Layout from '@/components/Layout';
import Section from '@/components/Section';
import Container from '@/components/Container';
import SectionTitle from '@/components/SectionTitle';
import SectionText from '@/components/SectionText';
import FormSubmitWebsite from '@/components/FormSubmitWebsite';

import styles from '@/styles/Site.module.scss'

export default function Site() {
  const router = useRouter();
  const { url } = router.query;

  const siteUrl = restoreUrl(url);

  const { error, siteImages, isComplete } = useCollect({ siteUrl });

  log('[Site] Render', { error, siteImages, isComplete });

  useEffect(() => {
    log('[Site] Checking if url parameter exists', { isRead: router.isReady, url });
    // If we pick up the router and we don't have an active URL, redirect
    // back to the homepage as it's likely a navigation error
    if ( router.isReady && !url ) {
      log('[Site] No URL, redirecting to home');
      router.push('/');
    }
  }, [router.isReady, url]);

  useEffect(() => {
    log('[Site] Checking if scraping complete', { isComplete, error, siteUrl });
    if ( !isComplete || error ) return;
    const redirect = cleanUrl(siteUrl);
    log(`[Site] Scraping complete, redirecting to: ${redirect}`);
    router.push(`/sites/${encodeURIComponent(redirect)}`);
  }, [ isComplete, error, siteUrl])

  return (
    <Layout>
      <Head>
        <title>{`Analyzing ${cleanUrl(siteUrl)} - Image Carbon`}</title>
        <meta name="description" content={`Find out how much emissions ${cleanUrl(siteUrl)} produces from images alone!`} />
        <meta name="og:title" content={`${cleanUrl(siteUrl)} on Image Carbon`} />
        <meta name="og:description" content={`How does ${cleanUrl(siteUrl)} stack up with optimizing for the web?`} />
      </Head>

      {!error && (
        <Section className={`${styles.siteHeroSection} ${styles.siteHeroSectionLoading}`}>
          <Container className={styles.siteContainer} size="narrow">
            <SectionTitle>
              Scanning your site!
            </SectionTitle>
            {!siteImages && (
              <SectionText color="white" weight="semibold" size="small">
                This might take a few seconds...
              </SectionText>
            )}
            {siteImages && (
              <SectionText color="white" weight="semibold" size="small">
                Found <strong>{siteImages.length}</strong> images, calculating emissions...
              </SectionText>
            )}
          </Container>
        </Section>
      )}

      {error && (
        <Section>
          <Container>
            <SectionTitle>
              Something went wrong...
            </SectionTitle>

            <SectionText size="small">
              { error }
            </SectionText>

            <SectionText size="small">
              Try again or try a new site!
            </SectionText>

            <FormSubmitWebsite />
          </Container>
        </Section>
      )}

    </Layout>
  )
}