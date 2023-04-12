import { useState } from 'react';
import Head from 'next/head';
import { CldImage } from 'next-cloudinary';
import { FaPizzaSlice, FaCoffee, FaGasPump, FaPlusCircle, FaMinusCircle } from 'react-icons/fa';

import { cleanUrl, restoreUrl, deduplicateArrayByKey, addCommas, addNumbers } from '@/lib/util';
import { getCache } from '@/lib/sites-server';
import { formatDate } from '@/lib/datetime';

import Layout from '@/components/Layout';
import Section from '@/components/Section';
import Container from '@/components/Container';
import SectionTitle from '@/components/SectionTitle';
import SectionText from '@/components/SectionText';
import FormSubmitWebsite from '@/components/FormSubmitWebsite';
import Button from '@/components/Button';

import styles from '@/styles/Site.module.scss'

const carbonGasoline = 8887;
const carbonCoffee = 209;
const carbonPizza = 10800 / 8;
const REQUESTS_MONTHLY_MIN = 1000;
const REQUESTS_MONTHLY_INITIAL = 10000;
const REQUESTS_MONTHLY_INCREMENT = 10000;

const ALREADY_OPTIMIZED_SIZE_THRESHOLD = 5000;
const ALREADY_OPTIMIZED_PERCENTAGE_THRESHOLD = 5;

export default function Site({ siteUrl: url, images: siteImages, dateCollected: dateCollectedString }) {
  const siteUrl = restoreUrl(url);
  const dateCollected = new Date(dateCollectedString);

  // Total number of bytes the original images weigh

  const totalBytesOriginal = siteImages ? addNumbers(siteImages?.map(({ original }) => original?.size)) : undefined;
  const totalBytesOptimized = siteImages ? addNumbers(siteImages?.map(({ optimized }) => optimized?.size)) : undefined;

  // Estimated emissions

  const totalCo2Original = siteImages ? addNumbers(siteImages?.map(({ original }) => original?.co2)) : undefined;
  const totalCo2Optimized = siteImages ? addNumbers(siteImages?.map(({ optimized }) => optimized?.co2)) : undefined;
  const totalCo2Savings = totalCo2Original && totalCo2Optimized && Math.ceil(100 - (totalCo2Optimized / totalCo2Original * 100));

  const lastRefreshed = formatDate(dateCollected);

  const [requestsMonthly, setRequestsMonthly] = useState(REQUESTS_MONTHLY_INITIAL);
  const [showAllImages, setShowAllImages] = useState(false);

  const isBytesOptimized = dateCollected && totalBytesOriginal <= totalBytesOptimized + ALREADY_OPTIMIZED_SIZE_THRESHOLD
  const isPercentageOptimized = totalCo2Savings <= ALREADY_OPTIMIZED_PERCENTAGE_THRESHOLD;
  const isSiteAlreadyOptimized = isBytesOptimized || isPercentageOptimized;

  const requestsYearly = requestsMonthly * 12;

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

  if ( !showAllImages ) {
    activeImages = activeImages?.slice(0, 3);
  }

  const numberHiddenImages = activeImages && siteImages.length - activeImages.length;

  function handleOnRequestsAdd() {
    if ( requestsMonthly === REQUESTS_MONTHLY_MIN ) {
      setRequestsMonthly(REQUESTS_MONTHLY_INCREMENT);
      return;
    }
    setRequestsMonthly(requestsMonthly + REQUESTS_MONTHLY_INCREMENT);
  }

  function handleOnRequestsSubtract() {
    if ( requestsMonthly === REQUESTS_MONTHLY_MIN ) return;

    if ( requestsMonthly === REQUESTS_MONTHLY_INCREMENT) {
      setRequestsMonthly(REQUESTS_MONTHLY_MIN);
      return;
    }

    setRequestsMonthly(requestsMonthly - REQUESTS_MONTHLY_INCREMENT);
  }

  function handleShowMoreImages() {
    setShowAllImages(true);
  }

  return (
    <Layout>
      <Head>
        <title>{`Results for ${cleanUrl(siteUrl)} - Image Carbon`}</title>
        <meta name="description" content={`Find out how much emissions ${cleanUrl(siteUrl)} produces from images alone!`} />
        <meta name="og:title" content={`${cleanUrl(siteUrl)} on Image Carbon`} />
        <meta name="og:description" content={`How does ${cleanUrl(siteUrl)} stack up with optimizing for the web?`} />
      </Head>

      <span className="sr-only">
        {/** Hiddne image used to pre-load the screenshot before the visitor hits the page */}
        {siteUrl && (
          <CldImage
            src={siteUrl}
            deliveryType="url2png"
            width={800}
            height={600}
            crop="fill"
            gravity="north"
            alt={`${siteUrl} Screenshot`}
            priority
          />
        )}
      </span>

      <div data-is-site-optimized={isSiteAlreadyOptimized}>
        <Section className={styles.siteHeroSection}>
          <Container className={`${styles.siteContainer} ${styles.siteHeroContainer}`} size="narrow">

            {isSiteAlreadyOptimized && (
              <>
                <SectionTitle>
                  You&apos;re already doing a <strong>great job</strong> optimizing your images!
                </SectionTitle>
                <SectionText color="white" weight="semibold" size="small">
                  But your website still produced <strong>{ totalCo2Original && addCommas(totalCo2Original.toFixed(2)) }g</strong> of carbon from images alone.
                </SectionText>
              </>
            )}

            {!isSiteAlreadyOptimized && (
              <>
                <SectionTitle>
                  You could reduce <strong>{ totalCo2Savings }%</strong> of the CO2 by <strong>optimizing your images</strong>!
                </SectionTitle>
              </>
            )}

            <SectionText size="small">
              Estimated using the <a href="https://sustainablewebdesign.org/calculating-digital-emissions/">Sustainable Web Design</a> model.
            </SectionText>

            <div className={styles.preview}>
              <figure className={styles.previewImage}>
                {siteUrl && (
                  <CldImage
                    src={siteUrl}
                    deliveryType="url2png"
                    width={800}
                    height={600}
                    crop="fill"
                    gravity="north"
                    alt={`${siteUrl} Screenshot`}
                    priority
                  />
                )}
                <figcaption>
                  <p><a href={siteUrl}>{ siteUrl }</a></p>
                  <p>Last Refreshed: { lastRefreshed }</p>
                </figcaption>
              </figure>
              <div className={styles.previewStats}>
                <div>
                  {!isSiteAlreadyOptimized && (
                    <h3>Original</h3>
                  )}

                  {isSiteAlreadyOptimized && (
                    <h3>Your Site</h3>
                  )}

                  <ul>
                    <li>Total Size of Images: <span>{ totalBytesOriginal && Math.ceil(totalBytesOriginal / 1000) }kb</span></li>
                    <li>Est. CO2: <span>{ totalCo2Original?.toFixed(2) }g</span></li>
                  </ul>
                </div>
                {!isSiteAlreadyOptimized && (
                  <div>
                    <h3>Optimized</h3>

                    <ul>
                      <li>Total Size of Images: <span>{ totalBytesOptimized && Math.ceil(totalBytesOptimized / 1000) }kb</span></li>
                      <li>Est. CO2: <span>{ totalCo2Optimized?.toFixed(2) }g</span></li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </Section>

        <Section>
          <Container className={`${styles.siteContainer}`} size="narrow">
            <div className={styles.assuming}>
              <SectionText color="white" weight="semibold" size="small">
                Now assuming you get
              </SectionText>
              <div className={styles.assumingCounter}>
                <button className={styles.assumingCounterButton} onClick={handleOnRequestsAdd}>
                  <FaPlusCircle />
                </button>
                <SectionTitle as="span">
                  <strong>{ addCommas(requestsMonthly) }</strong>
                </SectionTitle>
                <button className={styles.assumingCounterButton} onClick={handleOnRequestsSubtract} disabled={requestsMonthly === REQUESTS_MONTHLY_MIN}>
                  <FaMinusCircle />
                </button>
              </div>
              <SectionText color="white" weight="semibold" size="small">
                unique visitors per month...
              </SectionText>
              <SectionText size="tiny">
              = { addCommas(requestsMonthly * 12) } requests per year
              </SectionText>
            </div>

            <SectionTitle as="h2">
              How much <strong>carbon</strong> is that <strong>per year</strong>?
            </SectionTitle>

            <SectionText color="white" weight="semibold" size="small">
              Producing <strong>{ addCommas((totalCo2Original * requestsMonthly)?.toFixed(2)) }g</strong> is like the equivalent of...
            </SectionText>

            <SectionText size="tiny">
              { addCommas(totalCo2Original?.toFixed(2)) }g x { addCommas(requestsMonthly) } = { addCommas((totalCo2Original * requestsMonthly)?.toFixed(2)) }g
            </SectionText>

            <div className={styles.iconGrid}>
              <ul>
                <li>
                  <span className={styles.iconGridIcon}>
                    <FaPizzaSlice />
                  </span>
                  <span className={styles.iconGridTitle}>
                    <strong>{ (( totalCo2Original * requestsYearly ) / carbonPizza)?.toFixed(1) }</strong> slices of neapolitan pizza
                  </span>
                </li>
                <li>

                  <span className={styles.iconGridIcon}>
                    <FaGasPump />
                  </span>
                  <span className={styles.iconGridTitle}>
                    <strong>{ (( totalCo2Original * requestsYearly ) / carbonGasoline)?.toFixed(1) }</strong> gallons of gas burned
                  </span>
                </li>
                <li>
                  <span className={styles.iconGridIcon}>
                    <FaCoffee />
                  </span>
                  <span className={styles.iconGridTitle}>
                    <strong>{ (( totalCo2Original * requestsYearly ) / carbonCoffee)?.toFixed(1) }</strong> cups of coffee
                  </span>
                </li>
              </ul>
            </div>

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
                <li>
                  <a href="https://www.23degrees.com.au/blog/carbon-footprint-coffee-supply-chain/">
                    What is the carbon footprint of your cup of coffee?
                  </a>
                </li>
              </ul>
            </div>

          </Container>
        </Section>

        <Section>
          <Container className={`${styles.siteContainer}`} size="narrow">

            <SectionTitle as="h2">
              Here&apos;s a breakdown of your images...
            </SectionTitle>

            <SectionText size="small" weight="normal">
              Optimizations use a format of AVIF with smart compression.
            </SectionText>

            <SectionText size="tiny" weight="normal" color="note">
              Note: Images may appear cropped and optimized for display purposes only. Results are based on original full-sized images that are embedded in the page.
            </SectionText>

            <ul className={styles.breakdownImages}>
              {activeImages && activeImages.map(image => {

                const isImageAlreadyOptimized = image.original?.size <= image.optimized?.size + ALREADY_OPTIMIZED_SIZE_THRESHOLD;

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
                            Carbon: { image.original?.co2?.toFixed(2) }g
                          </p>
                        </div>
                        {!isSiteAlreadyOptimized && (
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
                              Carbon: { image.optimized?.co2?.toFixed(2) }g
                            </p>
                          </div>
                        )}
                      </div>
                      <div className={styles.breakdownMeta}>
                        {isImageAlreadyOptimized && (
                          <>
                            <h3>Nice work!</h3>
                            <p>
                              Seems like you are already optimizing your images.
                            </p>
                          </>
                        )}
                        {!isImageAlreadyOptimized && (
                          <>
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
                          </>
                        )}
                      </div>
                    </div>

                    <ul className={styles.breakdownUrls}>
                      <li>
                        <p>
                          Original: <a href={image?.original.url} title={image?.original.url}>{ image?.original.url }</a>
                        </p>
                      </li>
                      <li>
                        <p>
                          Optimized: <a href={image?.optimized.url} title={image?.optimized.url}>{ image?.optimized.url }</a>
                        </p>
                      </li>
                    </ul>
                  </li>
                )
              })}
            </ul>
            {!showAllImages && (
              <p>
                <Button onClick={handleShowMoreImages}>Show More Images</Button>
              </p>
            )}
            {typeof numberHiddenImages === 'number' && numberHiddenImages > 0 && (
              <SectionText className={styles.breakdownHidden} size="tiny" color="note">
                <strong>{ numberHiddenImages }</strong> images not shown due to deduplication or smaller than 5kb in size.
              </SectionText>
            )}
          </Container>
        </Section>
        <Section>
          <Container>
            <SectionTitle as="h2">
              What you&apos;re doing right...
            </SectionTitle>

            <SectionText size="small">
              Text
            </SectionText>

          </Container>
        </Section>
        <Section>
          <Container>
            <SectionTitle as="h2">
              What Else You Could be Doing...
            </SectionTitle>

            <SectionText size="small">
              Text
            </SectionText>

          </Container>
        </Section>
        <Section>
          <Container>
            <SectionTitle as="h2">
              More Resources to Learn
            </SectionTitle>

            <SectionText size="small">
              Text
            </SectionText>

          </Container>
        </Section>
        <Section id="check-another-site">
          <Container>
            <SectionTitle as="h2">
              Check another website!
            </SectionTitle>

            <SectionText size="small">
              Whether it&apos;s another page or a whole new site, it&apos;s
              important to have an understanding of where projects stand.
            </SectionText>

            <FormSubmitWebsite />
          </Container>
        </Section>

      </div>

    </Layout>
  )
}

export async function getServerSideProps({ params }) {
  let { siteUrl } = params;

  const { images: cacheImages, dateCollected } = await getCache({ siteUrl });

  if ( !cacheImages ) {
    return {
      redirect: {
        destination: `/site?url=${siteUrl}`,
        permanent: false,
      },
    }
  }

  console.log(`[${cleanUrl(siteUrl)}] Cache found! Restoring ${cacheImages.length} images.`)

  const images = cacheImages.map(image => {
    return {
      ...image,
      optimized: JSON.parse(image.optimized),
      original: JSON.parse(image.original),
      uploaded: JSON.parse(image.uploaded)
    }
  });

  return {
    props: {
      siteUrl,
      images,
      dateCollected: dateCollected.toISOString()
    }
  }
}