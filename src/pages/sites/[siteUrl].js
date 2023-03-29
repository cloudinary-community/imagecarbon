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

  const [error, setError] = useState();

  const [siteImages, setSiteImages] = useState();

  // Default the loading state to true as the first action the page will take is the scrape
  // if not cached
  const [scrapeIsLoading, setScrapeIsLoading] = useState(true);

  // Default the cache loading state to true so we don't show the site until we know it's cached
  const { data: cacheData, error: cacheError, isLoading: cacheIsLoading = true } = useSWR(`/api/sites/cache?url=${siteUrl}`, fetcher);
  
  const isLoading = scrapeIsLoading || cacheIsLoading;
  const isOptimized = siteImages?.filter(({ optimized }) => !!optimized)?.length > 0;

  // Total number of bytes the original images weigh

  const totalBytesOriginal = siteImages ? addNumbers(siteImages?.map(({ original }) => original.size)) : undefined;
  const totalBytesOptimized = siteImages && isOptimized ? addNumbers(siteImages?.map(({ optimized }) => optimized.size)) : undefined;

  // Estimated emissions

  const totalCo2Original = siteImages ? addNumbers(siteImages?.map(({ original }) => original.co2)) : undefined;
  const totalCo2Optimized = siteImages && isOptimized ? addNumbers(siteImages?.map(({ optimized }) => optimized.co2)) : undefined;
  const totalCo2Savings = totalCo2Original && totalCo2Optimized && Math.ceil(100 - (totalCo2Optimized / totalCo2Original * 100));

  // Construct an array of images that actually make sense to show, with
  // non negligible sizes and deduplication

  let activeImages = deduplicateArrayByKey(siteImages, ({ original }) => original.url);
  
  activeImages = activeImages?.filter(({ original }) => {
    if ( !original?.size ) return true;
    // Filter out images smaller than 5kb
    return original.size > 5000;
  }).map(image => {
    // Collect the savings for each image both in size and carbon
    if ( !image.original?.co2 || !image.original?.size ) return image;

    const savingsSize = image.original?.size - image.optimized?.size;
    const savingsCarbon = image.original?.co2 - image.optimized?.co2;

    return {
      ...image,
      savingsSize,
      savingsCarbon
    }
  });

  // Sort the images by the biggest savings in carbon

  activeImages?.sort((a, b) => b.savingsCarbon - a.savingsCarbon);

  const numberHiddenImages = activeImages && siteImages.length - activeImages.length;

  useEffect(() => {
    if ( typeof cacheData === 'undefined' && !cacheError ) return;

    setError(false);

    console.log(`Begin scraping ${siteUrl}...`);

    if ( cacheData.images ) {
      console.log(`Cache found! Restoring ${cacheData.images.length} images.`)

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

        console.log(`Found ${images?.length} images.`)

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
        setError(e.message);
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


      {isLoading && !error && (
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

      {!isLoading && !error && (
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
              
              <SectionDescription size="small" weight="normal">
                Optimizations use a format of AVIF with smart compression.
              </SectionDescription>
              
              <SectionDescription size="tiny" weight="normal" color="note">
                Note: Images may appear cropped and optimized for display purposes only. Results are based on original full-sized images.
              </SectionDescription>
              
              <ul className={styles.breakdownImages}>
                {activeImages && activeImages.map(image => {
                  const estimatedSizeSavings = Math.ceil((image.original?.size - image.optimized?.size) / 1000);
                  const estimatedCarbonSavings = Math.ceil((image.original?.co2 - image.optimized?.co2) / 1000);

                  return (
                    <li key={image?.original.url}>
                      <div className={styles.breakdownImage}>
                        <div className={styles.breakdownVersions}>
                          <div>
                            {image?.uploaded?.url && (
                              <CldImage
                                key={image.uploaded.url}
                                src={image.uploaded.url}
                                width="800"
                                height="600"
                                crop="fill"
                                gravity="center"
                                alt={`Original image optimized showing text-based results`}
                                loading="lazy"
                              />
                            )}
                            <p>
                              Size: { image.original?.size && Math.ceil(image.original?.size / 1000) }kb
                            </p>
                            <p>
                              Carbon: { image.original?.co2?.toFixed(3) }g
                            </p>
                          </div>
                          <div>
                            {image?.optimized?.url && (
                              <CldImage
                                key={image.optimized.url}
                                src={image.optimized.url}
                                width="800"
                                height="600"
                                crop="fill"
                                gravity="center"
                                alt={`Optimized image showing results`}
                                loading="lazy"
                              />
                            )}
                            <p>
                              Size: { image.optimized?.size && Math.ceil(image.optimized?.size / 1000) }kb
                            </p>
                            <p>
                              Carbon: { image.optimized?.co2?.toFixed(3) }g
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
                      <p className={styles.breakdownUrl}>
                        <a href={image?.original.url} title={image?.original.url}>{ image?.original.url }</a>
                      </p>
                    </li>
                  )
                })}
              </ul>
              {numberHiddenImages && numberHiddenImages > 0 && (
                <SectionDescription className={styles.breakdownHidden} size="tiny" color="note">
                  <strong>{ numberHiddenImages }</strong> images not shown due to deduplication or smaller than 5kb in size.
                </SectionDescription>
              )}
            </Container>
          </Section>
          <Section id="check-another-site">
            <Container>
              <SectionTitle>
                Check another website!
              </SectionTitle>
              
              <SectionDescription size="small">
                Whether it&apos;s another page or a whole new site, it&apos;s
                important to have an understanding of where projects stand.
              </SectionDescription>

              <FormSubmitWebsite />
            </Container>
          </Section>
        </>
      )}

      {error && (
        <Section>
          <Container>
            <SectionTitle>
              Something went wrong...
            </SectionTitle>
              
            <SectionDescription size="small">
              Error: { error }
            </SectionDescription>
              
            <SectionDescription size="small">
              Try again or try a new site!
            </SectionDescription>

            <FormSubmitWebsite />
          </Container>
        </Section>
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