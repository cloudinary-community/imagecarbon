import { useState, useEffect } from 'react';
import Head from 'next/head'
import { CldImage } from 'next-cloudinary'
import { constructCloudinaryUrl } from '@cloudinary-util/url-loader';
import { co2, hosting } from '@tgwf/co2';
import { FaTree } from 'react-icons/fa';

import { cleanUrl, restoreUrl } from '@/lib/util';
import { getSignedImageUrl } from '@/lib/cloudinary';

import Layout from '@/components/Layout';
import Section from '@/components/Section';
import Container from '@/components/Container';
import SectionTitle from '@/components/SectionTitle';
import SectionDescription from '@/components/SectionDescription';
import FormSubmitWebsite from '@/components/FormSubmitWebsite';
import Button from '@/components/Button';

import styles from '@/styles/Site.module.scss'

const emissions = new co2();

export default function Site({ siteUrl, meta = {} }) {
  const { isGreenHost = false, screenshotUrl } = meta;

  const [siteImages, setSiteImages] = useState();

  // Total number of bytes the original images weigh

  const imagesBytesOriginal = siteImages?.map(({ size }) => size).reduce((prev, curr) => prev + curr, 0);
  const imagesBytesOptimized = siteImages?.map(({ optimizedSize }) => optimizedSize)
    .filter(optimizedSize => typeof optimizedSize === 'number')
    .reduce((prev, curr) => prev + curr, 0);

  // Estimated

  const imagesEstimatedCO2 = emissions.perByte(imagesBytesOriginal, isGreenHost).toFixed(3);
  const imagesEstimatedCO2Optimized = emissions.perByte(imagesBytesOptimized, isGreenHost).toFixed(3);
  const imagesEstimatedCO2Savings = imagesEstimatedCO2 && imagesEstimatedCO2Optimized && Math.ceil(100 - (imagesEstimatedCO2Optimized / imagesEstimatedCO2 * 100));

  useEffect(() => {
    (async function run() {
      try {
        // First grab all of the images from the passed in URL

        const { images } = await fetch('/api/scrape', {
          method: 'POST',
          body: JSON.stringify({
            siteUrl
          })
        }).then(r => r.json());

        setSiteImages(images);

        // Loop through all images and get the file size of the Cloudinary version

        const optimizedImages = await Promise.all(images.map(async (image) => {
          const cloudinaryUrl = constructCloudinaryUrl({
            options: {
              width: 960,
              height: 540,
              crop: 'fill',
              gravity: 'center',
              src: image.url,
              deliveryType: 'fetch'
            },
            config: {
              cloud: {
                cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
              }
            }
          });

          const data = await fetch(cloudinaryUrl).then(r => r.blob())

          return {
            cloudinaryUrl,
            originalUrl: image.url,
            size: data.size
          }
        }));

        setSiteImages(prev => {
          return prev.map((image) => {
            const optimized = optimizedImages.find(({ originalUrl }) => originalUrl === image.url);
            return {
              ...image,
              optimizedUrl: optimized.cloudinaryUrl,
              optimizedSize: optimized.size
            }
          })
        });
      } catch(e) {
        console.log('e', e);
      }
    })();
  }, []);
  
  return (
    <Layout>
      <Head>
        <title>Image Carbon</title>
        <meta name="description" content="Image Carbon" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Section>
        <Container className={styles.siteContainer} size="narrow">
          <SectionDescription color="white" weight="semibold" size="small">
            Your website produced <strong>{ imagesEstimatedCO2 }g</strong> of carbon from images alone.
          </SectionDescription>

          <SectionTitle>
            You could reduce <strong>{ imagesEstimatedCO2Savings }%</strong> of the CO2 by <strong>optimizing your images</strong>!
          </SectionTitle>
          
          <SectionDescription size="small">
            Estimated using the <a href="https://sustainablewebdesign.org/calculating-digital-emissions/">Sustainable Web Design</a> model.
          </SectionDescription>

          <div className={styles.preview}>
            <figure className={styles.previewImage}>
              {screenshotUrl && (
                <img
                  width="960"
                  height="540"
                  // crop="fill"
                  src={screenshotUrl}
                  alt={`${siteUrl} Screenshot`}
                />
              )}
              <figcaption><a href={siteUrl}>{ siteUrl }</a></figcaption>
            </figure>
            <div className={styles.previewStats}>
              <h3>Original</h3>

              <ul>
                <li>Total Size of Images: <span>{ imagesBytesOriginal && Math.ceil(imagesBytesOriginal / 1000) }kb</span></li>
                <li>Est. CO2: <span>{ imagesEstimatedCO2 }g</span></li>
              </ul>

              <h3>Optimized</h3>

              <ul>
                <li>Total Size of Images: <span>{ imagesBytesOptimized && Math.ceil(imagesBytesOptimized / 1000) }kb</span></li>
                <li>Est. CO2: <span>{ imagesEstimatedCO2Optimized }g</span></li>
              </ul>
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
            Producing <strong>{ imagesEstimatedCO2 }g</strong> is like the equivalent of...
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
            Note: Images may appear cropped for display purposes only. Results are based on original full-sized images.
          </SectionDescription>
          
          <ul className={styles.breakdownImages}>
            {siteImages && siteImages.map(siteImage => {
              const estimatedSizeSavings = Math.ceil((siteImage.size - siteImage.optimizedSize) / 1000);
              const estimatedCarbonSavings = emissions.perByte(siteImage.size - siteImage.optimizedSize, isGreenHost).toFixed(3);
              return (
                <li key={siteImage.url}>
                  <p className={styles.breakdownUrl}>
                    <a href={siteImage.url}>{ siteImage.url }</a>
                  </p>
                  <div className={styles.breakdownImage}>
                    <div className={styles.breakdownVersions}>
                      <div className={styles.breakdownOriginal}>
                        <span>
                          <img
                            width="960"
                            height="540"
                            src={siteImage.url}
                            alt={`Original Image`}
                            loading="lazy"
                          />
                        </span>
                        <p>
                          Size: { siteImage.size && Math.ceil(siteImage.size / 1000) }kb
                        </p>
                        <p>
                          Carbon: { emissions.perByte(siteImage.size, isGreenHost).toFixed(3) }g
                        </p>
                      </div>
                      <div>
                        <CldImage
                          width="960"
                          height="540"
                          crop="fill"
                          gravity="center"
                          src={siteImage.url}
                          deliveryType="fetch"
                          alt={`Optimized Image`}
                        />
                        <p>
                          Size: { siteImage.optimizedSize && Math.ceil(siteImage.optimizedSize / 1000) }kb
                        </p>
                        <p>
                          Carbon: { emissions.perByte(siteImage.optimizedSize, isGreenHost).toFixed(3) }g
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

    </Layout>
  )
}

export async function getStaticProps({ params }) {
  let { siteUrl } = params;

  // Make sure the URL has everything it needs including a protocol

  siteUrl = restoreUrl(siteUrl);

  let isGreenHost = false;

  try {
    // Hosting requires domain without protocol or trailing slash
    isGreenHost = await hosting.check(cleanUrl(siteUrl));
  } catch(e) {
    console.log(`Failed to check host status: ${e.message}`);
  }

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
        isGreenHost,
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