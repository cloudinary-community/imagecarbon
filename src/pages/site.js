import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { CldImage } from 'next-cloudinary';

import { cleanUrl, restoreUrl } from '@/lib/util';

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

  const { error, siteImages, isLoading, isComplete } = useCollect({ siteUrl });

  useEffect(() => {
    if ( !isComplete || error ) return;
    const redirect = cleanUrl(siteUrl);
    router.push(`/sites/${encodeURIComponent(redirect)}`);
  }, [siteImages, isLoading])

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