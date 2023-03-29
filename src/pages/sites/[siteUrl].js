import { useState, useEffect } from 'react';
import Head from 'next/head';
import { CldImage } from 'next-cloudinary';
import useSWR from 'swr';


import { FaTree } from 'react-icons/fa';

import { restoreUrl, addNumbers, deduplicateArrayByKey } from '@/lib/util';
import { getSignedImageUrl } from '@/lib/cloudinary-server';
import { scrapeImagesFromWebsite } from '@/lib/scraping';

import Layout from '@/components/Layout';
import Section from '@/components/Section';
import Container from '@/components/Container';
import SectionTitle from '@/components/SectionTitle';
import SectionDescription from '@/components/SectionDescription';
import FormSubmitWebsite from '@/components/FormSubmitWebsite';
import Button from '@/components/Button';

import styles from '@/styles/Site.module.scss'

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Site({ siteUrl, meta = {} }) {
  const { screenshotUrl } = meta;

  const [siteImages, setSiteImages] = useState();
  const [scrapeIsLoading, setScrapeIsLoading] = useState(false);

  const { data: cacheData, error: cacheError, isLoading: cacheIsLoading } = useSWR(`/api/sites/cache?url=${siteUrl}`, fetcher);
  
  const isLoading = scrapeIsLoading || cacheIsLoading;
  const isOptimized = siteImages?.filter(({ optimized }) => !!optimized)?.length > 0;

  // Total number of bytes the original images weigh

  const totalBytesOriginal = siteImages ? addNumbers(siteImages?.map(({ original }) => original.size)) : undefined;
  const totalBytesOptimized = siteImages && isOptimized ? addNumbers(siteImages?.map(({ optimized }) => optimized.size)) : undefined;

  // Estimated emissions

  const totalCo2Original = siteImages ? addNumbers(siteImages?.map(({ original }) => original.co2)) : undefined;
  const totalCo2Optimized = siteImages && isOptimized ? addNumbers(siteImages?.map(({ optimized }) => optimized.co2)) : undefined;
  const totalCo2Savings = totalCo2Original && totalCo2Optimized && Math.ceil(100 - (totalCo2Optimized / totalCo2Original * 100));

  useEffect(() => {
    if ( typeof cacheData === 'undefined' && !cacheError ) return;

    console.log(`Begin scraping ${siteUrl}...`);

    if ( cacheData.images ) {
      console.log(`Cache found! Restoring ${cacheData.length} images.`)

      const images = cacheData.images.map(image => {
        return {
          ...image,
          optimized: JSON.parse(image.optimized),
          original: JSON.parse(image.original),
          uploaded: JSON.parse(image.uploaded)
        }
      });
      
      setSiteImages(images);
      setScrapeIsLoading(false);

      return;
    }

    (async function run() {
      try {
        setScrapeIsLoading(true);

        // First grab all of the images from the passed in URL

        let { images } = await scrapeImagesFromWebsite({
          siteUrl
        });

        // Create a deduplicated list of just 

        images = deduplicateArrayByKey(images, 'url');

        console.log(`Found ${images.length} images.`)

        images = images.map(image => {
          return {
            original: {
              url: image.url
            }
          };
        });

        setSiteImages(images);

        const { images: imagesResults } = await fetch('/api/collect', {
          method: 'POST',
          body: JSON.stringify({
            images: images.map(({ original }) => original.url),
            siteUrl
          })
        }).then(r => r.json());

        console.log(`Collected image data and emissions results.`)

        setSiteImages(imagesResults);

        setScrapeIsLoading(false);

        await fetch('/api/sites/add', {
          method: 'POST',
          body: JSON.stringify({
            images: imagesResults,
            siteUrl
          })
        }).then(r => r.json());

        console.log(`Added site to cache for next time!`)
      } catch(e) {
        console.log(`Something went wrong! ${e.message}`);
      }
    })();
  }, [cacheData]);
  
  return (
    <Layout>
      <Head>
        <title>Image Carbon</title>
        <meta name="description" content="Image Carbon" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>


      {isLoading && (
        <Section>
          <Container className={styles.siteContainer} size="narrow">
            <SectionTitle>
              Scanning your site!
            </SectionTitle>
            <SectionDescription color="white" weight="semibold" size="small">
              This might take a few seconds...
            </SectionDescription>
          </Container>
        </Section>
      )}

      {!isLoading && (
        <>
          <Section>
            <Container className={styles.siteContainer} size="narrow">
              <SectionDescription color="white" weight="semibold" size="small">
                Your website produced <strong>{ totalCo2Original?.toFixed(3) }g</strong> of carbon from images alone.
              </SectionDescription>

              <SectionTitle>
                You could reduce <strong>{ totalCo2Savings }%</strong> of the CO2 by <strong>optimizing your images</strong>!
              </SectionTitle>

              <SectionDescription size="small">
                Estimated using the <a href="https://sustainablewebdesign.org/calculating-digital-emissions/">Sustainable Web Design</a> model.
              </SectionDescription>

              <div className={styles.preview}>
                <figure className={styles.previewImage}>
                  {screenshotUrl && (
                    <img
                      width="800"
                      height="600"
                      // crop="fill"
                      src={screenshotUrl}
                      alt={`${siteUrl} Screenshot`}
                    />
                  )}
                  <figcaption><a href={siteUrl}>{ siteUrl }</a></figcaption>
                </figure>
                <div className={styles.previewStats}>
                  <div>
                    <h3>Original</h3>

                    <ul>
                      <li>Total Size of Images: <span>{ totalBytesOriginal && Math.ceil(totalBytesOriginal / 1000) }kb</span></li>
                      <li>Est. CO2: <span>{ totalCo2Original?.toFixed(3) }g</span></li>
                    </ul>
                  </div>
                  <div>
                    <h3>Optimized</h3>

                    <ul>
                      <li>Total Size of Images: <span>{ totalBytesOptimized && Math.ceil(totalBytesOptimized / 1000) }kb</span></li>
                      <li>Est. CO2: <span>{ totalCo2Optimized?.toFixed(3) }g</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </Container>
          </Section>

          <Section>
            <Container className={`${styles.siteContainer}`} size="narrow">

              <SectionTitle>
                How much <strong>carbon</strong> is that?
              </SectionTitle>
              
              <SectionDescription color="white" weight="semibold" size="small">
                Producing <strong>{ totalCo2Original?.toFixed(3) }g</strong> is like the equivalent of...
              </SectionDescription>

              <div className={styles.iconGrid}>
                <ul>
                  <li>
                    <span className={styles.iconGridIcon}>
                      <FaTree />
                    </span>
                    <span className={styles.iconGridTitle}>
                      <strong>10</strong> trees
                    </span>
                  </li>
                  <li>
                    <span className={styles.iconGridIcon}>
                      <FaTree />
                    </span>
                    <span className={styles.iconGridTitle}>
                      <strong>10</strong> trees
                    </span>
                  </li>
                  <li>
                    <span className={styles.iconGridIcon}>
                      <FaTree />
                    </span>
                    <span className={styles.iconGridTitle}>
                      <strong>10</strong> trees
                    </span>
                  </li>
                </ul>
              </div>
              
              <SectionDescription color="white" weight="semibold" size="small">
                for every <strong>10,000</strong> requests
              </SectionDescription>

              <div className={styles.sources}>
                <ul>
                  <li>
                    <a href="https://onetreeplanted.org/blogs/stories/how-much-co2-does-tree-absorb">
                      One Tree Planted - How much CO2 does a tree absorb?
                    </a>
                  </li>
                  <li>
                    <a href="https://www.epa.gov/greenvehicles/greenhouse-gas-emissions-typical-passenger-vehicle#:~:text=typical%20passenger%20vehicle%3F-,A%20typical%20passenger%20vehicle%20emits%20about%204.6%20metric%20tons%20of,8%2C887%20grams%20of%20CO2.">
                      EPA - Greenhouse Gas Emissions from a Typical Passenger Vehicle
                    </a>
                  </li>
                </ul>
              </div>

            </Container>
          </Section>

          <Section>
            <Container className={`${styles.siteContainer}`} size="narrow">

              <SectionTitle>
                Here&apos;s a breakdown of your images...
              </SectionTitle>
              
              <SectionDescription size="small">
                Note: Images may appear cropped and optimized for display purposes only. Results are based on original full-sized images.
              </SectionDescription>
              
              <ul className={styles.breakdownImages}>
                {siteImages && siteImages.map(siteImage => {
                  const estimatedSizeSavings = Math.ceil((siteImage.original?.size - siteImage.optimized?.size) / 1000);
                  const estimatedCarbonSavings = Math.ceil((siteImage.original?.co2 - siteImage.optimized?.co2) / 1000);

                  return (
                    <li key={siteImage?.original.url}>
                      <p className={styles.breakdownUrl}>
                        <a href={siteImage?.original.url} title={siteImage?.original.url}>{ siteImage?.original.url }</a>
                      </p>
                      <div className={styles.breakdownImage}>
                        <div className={styles.breakdownVersions}>
                          <div>
                            {siteImage?.uploaded?.url && (
                              <CldImage
                                key={siteImage.uploaded.url}
                                src={siteImage.uploaded.url}
                                width="800"
                                height="600"
                                crop="fill"
                                gravity="center"
                                alt={`Original image optimized showing text-based results`}
                                loading="lazy"
                              />
                            )}
                            <p>
                              Size: { siteImage.original?.size && Math.ceil(siteImage.original?.size / 1000) }kb
                            </p>
                            <p>
                              Carbon: { siteImage.original?.co2?.toFixed(3) }g
                            </p>
                          </div>
                          <div>
                            {siteImage?.optimized?.url && (
                              <CldImage
                                key={siteImage.optimized.url}
                                src={siteImage.optimized.url}
                                width="800"
                                height="600"
                                crop="fill"
                                gravity="center"
                                alt={`Optimized image showing results`}
                                loading="lazy"
                              />
                            )}
                            <p>
                              Size: { siteImage.optimized?.size && Math.ceil(siteImage.optimized?.size / 1000) }kb
                            </p>
                            <p>
                              Carbon: { siteImage.optimized?.co2?.toFixed(3) }g
                            </p>
                          </div>
                        </div>
                        <div className={styles.breakdownMeta}>
                          <h3>You could save...</h3>

                          <p className={styles.breakdownMetaSavings}>
                            <strong>{ estimatedSizeSavings }kb</strong> = <strong>{ estimatedCarbonSavings }g</strong>
                          </p>

                          <p className={styles.breakdownMetaBy}>By...</p>

                          <ul className={styles.breakdownBetaSteps}>
                            <li>
                              Optimizing Images
                            </li>
                          </ul>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </Container>
          </Section>
        </>
      )}

    </Layout>
  )
}

export async function getStaticProps({ params }) {
  let { siteUrl } = params;

  // Make sure the URL has everything it needs including a protocol

  siteUrl = restoreUrl(siteUrl);

  const screenshotUrl = getSignedImageUrl(siteUrl, {
    type: 'url2png',
    gravity: 'north',
    height: 600,
    width: 800,
    crop: 'fill'
  });

  return {
    props: {
      siteUrl,
      meta: {
        screenshotUrl
      }
    }
  }
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking'
  }
}