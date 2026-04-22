import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { CldImage, CldOgImage } from 'next-cloudinary';
import { FaPizzaSlice, FaCoffee, FaGasPump, FaPlusCircle, FaMinusCircle, FaRedo, FaCheck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

import { cleanUrl, restoreUrl, deduplicateArrayByKey, addCommas, addNumbers, trimString, formatGrams, formatBytes } from '@/lib/util';
import { getCache } from '@/lib/sites-server';
import { clearCache } from '@/lib/sites';
import { formatDate } from '@/lib/datetime';
import { sourceSans } from '@/lib/fonts';

import Layout from '@/components/Layout';
import Section from '@/components/Section';
import Container from '@/components/Container';
import SectionTitle from '@/components/SectionTitle';
import SectionText from '@/components/SectionText';
import FormSubmitWebsite from '@/components/FormSubmitWebsite';
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';
import { cn } from '@/lib/cn';
import { HERO_GLOW, HERO_INNER } from '@/lib/heroClasses';

const CARBON_GASOLINE_GALLONS = 8887;
const CARBON_GASOLINE_LITERS = 2347.7;
const CARBON_COFFEE = 209;
const CARBON_PIZZA = 10800 / 8;
const REQUESTS_MONTHLY_MIN = 1000;
const REQUESTS_MONTHLY_INITIAL = 100000;
const REQUESTS_MONTHLY_INCREMENT = 50000;
const MIN_IMAGE_SIZE = 5000;

const ALREADY_OPTIMIZED_SIZE_THRESHOLD = 5000;
const ALREADY_OPTIMIZED_PERCENTAGE_THRESHOLD = 5;

const optimizedBreakdownImage = cn(
  'group-data-[is-site-optimized=true]/site:mx-auto group-data-[is-site-optimized=true]/site:max-w-[40em]'
);

const optimizedBreakdownVersions = 'group-data-[is-site-optimized=true]/site:grid-cols-1';

const breakdownVersionCard =
  'text-left [&_img]:block [&_img]:bg-brand-eggshell [&_p]:m-0 [&_p]:text-[1.3em] [&_p]:font-semibold [&_p:first-of-type]:mt-2';

const breakdownUrlsList = cn(
  'mt-12 list-none space-y-2 p-0 text-left text-[0.9em] text-ui-note',
  'group-data-[is-site-optimized=true]/site:text-center',
  '[&_a]:text-ui-note [&_a]:no-underline hover:[&_a]:underline'
);

const previewGrid =
  'mx-auto mt-8 grid max-w-[54em] grid-cols-1 gap-12 md:mt-16 md:grid-cols-[6fr_4fr] md:text-left';

const previewFigure =
  'relative mx-auto max-w-[30em] [&_img]:block [&_img]:bg-brand-eggshell [&_figcaption]:mt-[0.8em] [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption_p]:text-ui-note [&_figcaption_a]:block [&_figcaption_a]:overflow-hidden [&_figcaption_a]:text-ellipsis [&_figcaption_a]:whitespace-nowrap [&_figcaption_a]:text-ui-note [&_figcaption_a]:no-underline hover:[&_figcaption_a]:underline';

const tagGreenBadge =
  'absolute -right-4 -top-4 flex h-16 w-16 flex-col items-center justify-center rounded-full border-2 border-[rgb(44,162,1)] bg-ui-green text-[2em] text-white';

export default function Site({ siteUrl: url, images: siteImages, dateCollected: dateCollectedString, dateCollectedFormatted, screenshot }) {
  const router = useRouter();
  const siteUrl = restoreUrl(url);
  const dateCollected = new Date(dateCollectedString);

  const [requestsMonthly, setRequestsMonthly] = useState(REQUESTS_MONTHLY_INITIAL);
  const [editRequestsManually, setEditRequestsManually] = useState(false);

  const [showAllImages, setShowAllImages] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Total number of bytes the original images weigh

  const totalBytesOriginal = siteImages ? addNumbers(siteImages?.map(({ original }) => original?.size)) : undefined;
  const totalBytesOptimized = siteImages ? addNumbers(siteImages?.map(({ optimized }) => optimized?.size)) : undefined;

  // Estimated emissions

  const totalCo2Original = siteImages ? addNumbers(siteImages?.map(({ original }) => original?.co2)) : undefined;
  const totalCo2Optimized = siteImages ? addNumbers(siteImages?.map(({ optimized }) => optimized?.co2)) : undefined;
  const totalCo2Savings = totalCo2Original && totalCo2Optimized && Math.ceil(100 - (totalCo2Optimized / totalCo2Original * 100));

  const isBytesOptimized = dateCollected && totalBytesOriginal <= totalBytesOptimized + ALREADY_OPTIMIZED_SIZE_THRESHOLD
  const isPercentageOptimized = totalCo2Savings <= ALREADY_OPTIMIZED_PERCENTAGE_THRESHOLD;
  const isSiteAlreadyOptimized = isBytesOptimized || isPercentageOptimized;

  const improvements = [];
  const accomplishments = [];

  const numberModernFormat = siteImages?.filter(({ original }) => ['webp', 'avif'].includes(original?.format?.toLowerCase())).length;
  const numberRequiresLazy = siteImages?.filter(({ original }) => original.loading !== 'lazy').length;

  if ( numberRequiresLazy > 0 ) {
    improvements.push(`Adding loading="lazy" may help with ${numberRequiresLazy} images`)
  }

  if ( numberModernFormat > 0 ) {
    accomplishments.push(`You're already serving ${numberModernFormat} images with modern formats`)
  }

  if ( siteImages?.length > numberModernFormat ) {
    improvements.push(`${siteImages.length - numberModernFormat} images could be served with modern formats`)
  }

  const requestsYearly = requestsMonthly * 12;

  // Construct an array of images that actually make sense to show, with
  // non negligible sizes and deduplication

  let activeImages = deduplicateArrayByKey(siteImages, ({ original }) => original.url);

  activeImages = activeImages?.filter(({ original }) => {
    if ( !original?.size ) return true;
    // Filter out images smaller than 5kb
    return original.size > MIN_IMAGE_SIZE;
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

    if ( requestsMonthly - REQUESTS_MONTHLY_INCREMENT <= 0 ) {
      setRequestsMonthly(0);
      return;
    }

    setRequestsMonthly(requestsMonthly - REQUESTS_MONTHLY_INCREMENT);
  }

  function handleOnManualEdit(e) {
    e.preventDefault();
    const fields = Array.from(e.currentTarget.elements);
    const requestsMonthlyInput = fields.find(field => field.name === 'requests-monthly');
    setRequestsMonthly(requestsMonthlyInput.value);
    requestsMonthlyInput.value = undefined;
    setEditRequestsManually(false);
  }

  function handleShowMoreImages() {
    setShowAllImages(true);
  }

  async function handleOnRefresh(e) {
    e.preventDefault();
    setIsRefreshing(true);
    try {
      await clearCache({ siteUrl: cleanUrl(siteUrl) });
      router.push(`/site?url=${cleanUrl(siteUrl)}`);
    } catch(e) {
      setIsRefreshing(false);
    }
  }

  return (
    <Layout>
      <Head>
        <title>{`Results for ${cleanUrl(siteUrl)} - Image Carbon`}</title>
        <meta name="description" content={`Find out how much emissions ${cleanUrl(siteUrl)} produces from images alone!`} />
        <meta name="og:title" content={`${cleanUrl(siteUrl)} on Image Carbon`} />
        <meta name="og:description" content={`How does ${cleanUrl(siteUrl)} stack up with optimizing for the web?`} />
      </Head>

      {isSiteAlreadyOptimized && (
        <CldOgImage
          src="imagecarbon-assets/og-optimized-2400x1200_q2urz1"
          alt="How much carbon are you producing with your website images? ImageCarbon.com"
          twitterTitle="Optimize Images, Save the Planet with Image Carbon"
          overlays={[
            {
              url: screenshot?.url,
              position: {
                gravity: 'north_west',
                x: 0,
                y: 0
              },
              effects: [
                {
                  crop: 'fill',
                  gravity: 'north',
                  width: 1030,
                  height: 1200
                }
              ]
            },
            {
              width: 2400 - 1030 - 120 - 120,
              crop: 'crop',
              position: {
                x: 1030 + 120,
                y: 125,
                gravity: 'north_west',
              },
              text: {
                color: 'white',
                fontFamily: sourceSans.style.fontFamily,
                fontSize: 80,
                fontWeight: 'semibold',
                text: encodeURIComponent(trimString({
                  string: cleanUrl(siteUrl),
                  maxLength: 28
                }))
              },
            }
          ]}
        />
      )}

      {!isSiteAlreadyOptimized && (
        <CldOgImage
          src="imagecarbon-assets/og-blank-2400x1200_henniw"
          alt="How much carbon are you producing with your website images? ImageCarbon.com"
          twitterTitle="Optimize Images, Save the Planet with Image Carbon"
          overlays={[
            {
              url: screenshot?.url,
              position: {
                gravity: 'north_west',
                x: 0,
                y: 0
              },
              effects: [
                {
                  crop: 'fill',
                  gravity: 'north',
                  width: 1030,
                  height: 1200
                }
              ]
            },
            {
              width: 2400 - 1030 - 120 - 120,
              crop: 'crop',
              position: {
                x: 1030 + 120,
                y: 125,
                gravity: 'north_west',
              },
              text: {
                color: 'white',
                fontFamily: sourceSans.style.fontFamily,
                fontSize: 80,
                fontWeight: 'semibold',
                text: encodeURIComponent(trimString({
                  string: cleanUrl(siteUrl),
                  maxLength: 28
                }))
              }
            },
            {
              width: 2400 - 1030 - 120 - 120,
              crop: 'crop',
              position: {
                x: 1030 + 120,
                y: 260,
                gravity: 'north_west',
              },
              text: {
                color: 'rgb:EECC6E',
                fontFamily: sourceSans.style.fontFamily,
                fontSize: 150,
                fontWeight: 'bold',
                text: encodeURIComponent(totalCo2Original ? formatGrams(totalCo2Original * REQUESTS_MONTHLY_INITIAL * 12) : '-')
              }
            },
            {
              width: 2400 - 1030 - 120 - 120,
              crop: 'crop',
              position: {
                x: 1030 + 120,
                y: 390,
                gravity: 'north_west',
              },
              text: {
                color: 'white',
                fontFamily: sourceSans.style.fontFamily,
                fontSize: 100,
                fontWeight: 'bold',
                text: encodeURIComponent('Carbon / year')
              }
            },
            {
              width: 2400 - 1030 - 120 - 120 - 300,
              crop: 'fit',
              position: {
                x: 1030 + 120,
                y: 530,
                gravity: 'north_west',
              },
              text: {
                color: 'white',
                fontFamily: sourceSans.style.fontFamily,
                fontSize: 60,
                fontWeight: 'semibold',
                lineSpacing: '-10',
                text: encodeURIComponent('with 1k requests per month from images alone!')
              }
            },
          ]}
        />
      )}

      <span className="sr-only">
        {/** Hidden image used to pre-load the screenshot before the visitor hits the page */}
        {siteUrl && (
          <CldImage
            src={screenshot.url}
            width={screenshot.width}
            height={screenshot.height}
            alt={`${siteUrl} Screenshot`}
            priority
          />
        )}
      </span>

      <div
        className="group/site"
        data-is-site-optimized={isSiteAlreadyOptimized ? 'true' : 'false'}
      >
        <Section className={HERO_GLOW}>
          <Container className={cn(HERO_INNER, 'p-8')} size="narrow">

            {isSiteAlreadyOptimized && (
              <>
                <SectionTitle>
                  You&apos;re already doing a <strong>great job</strong> optimizing your images!
                </SectionTitle>
                <SectionText color="white" weight="semibold" size="small">
                  But your website still produced <strong>{ formatGrams(totalCo2Original, { fixed: 'auto' }) || '-' }</strong> of carbon from images alone.
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

            <div className={previewGrid}>
              <figure className={previewFigure}>
                {siteUrl && (
                  <CldImage
                    src={screenshot.url}
                    width={screenshot.width}
                    height={screenshot.height}
                    alt={`${siteUrl} Screenshot`}
                    priority
                  />
                )}
                {isSiteAlreadyOptimized && (
                  <span className={tagGreenBadge} data-color="green">
                    <span className="flex items-center justify-center">
                      <FaCheck />
                    </span>
                  </span>
                )}
                <figcaption>
                  <p className="grid">
                    <a href={siteUrl}>{ siteUrl }</a>
                  </p>
                  <p className="flex items-center justify-center">
                    Last Refreshed: { dateCollectedFormatted }
                    <button
                      className="ml-4 inline-flex cursor-pointer items-center border-0 bg-transparent text-ui-note hover:underline disabled:cursor-default disabled:text-ui-note/80 disabled:[&_svg]:animate-spin-icon"
                      onClick={handleOnRefresh}
                      disabled={isRefreshing}
                    >
                      <FaRedo className="mr-2" />
                      Refresh
                    </button>
                  </p>
                </figcaption>
              </figure>
              <div className="[&>div]:mb-8 [&>div:last-child]:mb-0 [&_h3]:mb-[0.4em] [&_h3]:text-3xl [&_ul]:m-0 [&_ul]:list-none [&_ul]:p-0 [&_ul]:text-[1.3em] [&_ul]:leading-[1.8] [&_li_span]:ml-2 [&_li_span]:text-brand-yellow">
                <div>
                  {!isSiteAlreadyOptimized && (
                    <h3>Original</h3>
                  )}

                  {isSiteAlreadyOptimized && (
                    <h3>Your Site</h3>
                  )}

                  <ul>
                    <li>Total Size of Images: <span>{ formatBytes(totalBytesOriginal) || '-' }</span></li>
                    <li>Est. CO2: <span>{ formatGrams(totalCo2Original) || '-' }</span></li>
                  </ul>
                </div>
                {!isSiteAlreadyOptimized && (
                  <div>
                    <h3>Optimized</h3>

                    <ul>
                      <li>Total Size of Images: <span>{ formatBytes(totalBytesOptimized) || '-' }</span></li>
                      <li>Est. CO2: <span>{ formatGrams(totalCo2Optimized) || '-' }</span></li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </Section>

        <Section>
          <Container className={HERO_INNER} size="narrow">
            <div className="mb-16">
              <SectionText className="!m-0" color="white" weight="semibold" size="small">
                Now assuming you get
              </SectionText>

              <div className="mx-auto my-[0.2em]">
                <div className="flex items-center justify-center">
                  <button
                    className="flex items-center justify-center border-0 bg-transparent text-2xl text-brand-eggshell transition-transform hover:scale-110 hover:text-white active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                    onClick={handleOnRequestsAdd}
                  >
                    <FaPlusCircle aria-label='Increment by 10,000' />
                  </button>
                  <SectionTitle as="span" className="mx-2 my-0">
                    <strong>{ addCommas(requestsMonthly) }</strong>
                  </SectionTitle>
                  <button
                    className="flex items-center justify-center border-0 bg-transparent text-2xl text-brand-eggshell transition-transform hover:scale-110 hover:text-white active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                    onClick={handleOnRequestsSubtract}
                    disabled={requestsMonthly === REQUESTS_MONTHLY_MIN}
                  >
                    <FaMinusCircle aria-label='Decrease by 10,000' />
                  </button>
                </div>
                <div className="my-2">
                  {!editRequestsManually && (
                    <p className="text-center">
                      <button
                        className="cursor-pointer border-0 bg-transparent font-[inherit] text-brand-yellow"
                        onClick={() => setEditRequestsManually(true)}
                      >
                        Enter Manually
                      </button>
                    </p>
                  )}
                  {editRequestsManually && (
                    <form onSubmit={handleOnManualEdit}>
                      <p className="text-center">
                        <FormInput type="number" name="requests-monthly" />
                      </p>
                      <p className="flex justify-center gap-2">
                        <button className="flex items-center justify-center border-0 bg-transparent text-2xl text-brand-eggshell">
                          <FaCheckCircle aria-label='Save' />
                        </button>
                        <button
                          className="flex items-center justify-center border-0 bg-transparent text-2xl text-brand-eggshell"
                          onClick={() => setEditRequestsManually(false)}
                        >
                          <FaTimesCircle aria-label='Cancel' />
                        </button>
                      </p>
                    </form>
                  )}
                </div>
              </div>

              <SectionText className="!m-0" color="white" weight="semibold" size="small">
                page views per month...
              </SectionText>
              <SectionText className="!m-0" size="tiny">
              = { addCommas(requestsMonthly * 12) } requests per year
              </SectionText>
            </div>

            <SectionTitle as="h2">
              How much <strong>carbon</strong> is that <strong>per year</strong>?
            </SectionTitle>

            <SectionText color="white" weight="semibold" size="small">
              Producing <strong>{ formatGrams(totalCo2Original * requestsYearly, { type: 'kg' } ) || '-' }</strong> is like the equivalent of...
            </SectionText>

            <SectionText size="tiny">
              { formatGrams(totalCo2Original) || '-' } x { addCommas(requestsYearly) } = { formatGrams(totalCo2Original * requestsYearly) } ({ formatGrams(totalCo2Original * requestsYearly, { type: 'kg' }) })
            </SectionText>

            <div className="my-16 flex w-full justify-center text-inherit">
              <ul className="mx-auto grid list-none grid-cols-1 gap-4 p-0 text-base md:grid-cols-3 md:gap-8 lg:text-xl">
                <li className="mb-8 flex flex-row items-center justify-start p-0 md:mb-0 md:flex-col md:items-center">
                  <span className="mb-0 mr-[0.8em] flex h-10 w-10 shrink-0 grow-0 items-center justify-center rounded-full bg-brand-yellow text-4xl text-brand-gray-dark sm:text-5xl md:mb-2 md:mr-0 md:h-auto md:w-auto md:p-2 md:text-6xl">
                    <FaPizzaSlice aria-hidden='true' />
                  </span>
                  <span className="block text-left text-base md:text-center md:text-lg lg:text-2xl">
                    <strong className="mb-2 block text-[1.5em] leading-[0.8] text-brand-yellow md:mb-2 lg:mb-2">
                      {totalCo2Original ? addCommas(((totalCo2Original * requestsYearly) / CARBON_PIZZA)?.toFixed(1)) : '-'}
                    </strong>{' '}
                    slices of neapolitan pizza
                  </span>
                </li>
                <li className="mb-8 flex flex-row items-center justify-start p-0 md:mb-0 md:flex-col md:items-center">
                  <span className="mb-0 mr-[0.8em] flex h-10 w-10 shrink-0 grow-0 items-center justify-center rounded-full bg-brand-yellow text-4xl text-brand-gray-dark sm:text-5xl md:mb-2 md:mr-0 md:h-auto md:w-auto md:p-2 md:text-6xl">
                    <FaGasPump aria-hidden='true' />
                  </span>
                  <span className="block text-left text-base md:text-center md:text-lg lg:text-2xl">
                    <strong className="mb-2 block text-[1.5em] leading-[0.8] text-brand-yellow md:mb-2 lg:mb-2">
                      {totalCo2Original ? addCommas(((totalCo2Original * requestsYearly) / CARBON_GASOLINE_GALLONS)?.toFixed(1)) : '-'}
                    </strong>{' '}
                    gallons of gas burned
                    <span className="mt-1 block text-sm md:mb-2 md:text-xs lg:text-xs">
                      or around {totalCo2Original ? addCommas(((totalCo2Original * requestsYearly) / CARBON_GASOLINE_LITERS)?.toFixed(1)) : '-'} liters
                    </span>
                  </span>
                </li>
                <li className="mb-8 flex flex-row items-center justify-start p-0 md:mb-0 md:flex-col md:items-center">
                  <span className="mb-0 mr-[0.8em] flex h-10 w-10 shrink-0 grow-0 items-center justify-center rounded-full bg-brand-yellow text-4xl text-brand-gray-dark sm:text-5xl md:mb-2 md:mr-0 md:h-auto md:w-auto md:p-2 md:text-6xl">
                    <FaCoffee aria-hidden='true' />
                  </span>
                  <span className="block text-left text-base md:text-center md:text-lg lg:text-2xl">
                    <strong className="mb-2 block text-[1.5em] leading-[0.8] text-brand-yellow md:mb-2 lg:mb-2">
                      {totalCo2Original ? addCommas(((totalCo2Original * requestsYearly) / CARBON_COFFEE)?.toFixed(1)) : '-'}
                    </strong>{' '}
                    cups of coffee
                  </span>
                </li>
              </ul>
            </div>

            <div className="text-inherit text-ui-note">
              <ul className="m-0 list-none p-0 leading-normal">
                <li>
                  <a className="text-ui-note no-underline hover:underline" href="https://www.mdpi.com/2071-1050/14/5/3125">
                    Carbon Footprint of a Typical Neapolitan Pizzeria
                  </a>
                </li>
                <li>
                  <a
                    className="text-ui-note no-underline hover:underline"
                    href="https://www.epa.gov/greenvehicles/greenhouse-gas-emissions-typical-passenger-vehicle#:~:text=typical%20passenger%20vehicle%3F-,A%20typical%20passenger%20vehicle%20emits%20about%204.6%20metric%20tons%20of,8%2C887%20grams%20of%20CO2."
                  >
                    EPA - Greenhouse Gas Emissions from a Typical Passenger Vehicle
                  </a>
                </li>
                <li>
                  <a
                    className="text-ui-note no-underline hover:underline"
                    href="https://www.23degrees.com.au/blog/carbon-footprint-coffee-supply-chain/"
                  >
                    What is the carbon footprint of your cup of coffee?
                  </a>
                </li>
              </ul>
            </div>

          </Container>
        </Section>

        <Section>
          <Container className={HERO_INNER} size="narrow">

            <SectionTitle as="h2">
              Here&apos;s a breakdown of your images...
            </SectionTitle>

            <SectionText size="small" weight="normal">
              Optimizations use a format of AVIF with smart compression.
            </SectionText>

            <SectionText size="tiny" weight="normal" color="note">
              Note: Images may appear cropped and optimized for display purposes only. Results are based on original full-sized images that are embedded in the page.
            </SectionText>

            <ul className="mt-16 list-none space-y-24 p-0">
              {activeImages && activeImages.map(image => {

                const isImageAlreadyOptimized = image.original?.size <= image.optimized?.size + ALREADY_OPTIMIZED_SIZE_THRESHOLD;

                const estimatedSizeSavings = ( image.original?.size - image.optimized?.size ) * requestsYearly;
                const estimatedCarbonSavings = ( image.original?.co2 - image.optimized?.co2 ) * requestsYearly;

                return (
                  <li key={image?.original.url}>
                    <div
                      className={cn(
                        'grid w-full grid-cols-1 gap-8 min-[960px]:grid-cols-[7fr_3fr] min-[960px]:gap-8 lg:gap-12',
                        optimizedBreakdownImage
                      )}
                    >
                      <div
                        className={cn(
                          'm-0 grid grid-cols-1 gap-8 text-left sm:grid-cols-2 lg:gap-12',
                          optimizedBreakdownVersions
                        )}
                      >
                        <div className={breakdownVersionCard}>
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
                            Format: { image.original?.format }
                          </p>
                          <p>
                            Size: { formatBytes(image.original?.size) || '-' }
                          </p>
                          <p>
                            Carbon: { formatGrams(image.original?.co2, { fixed: 3 }) }
                          </p>
                        </div>
                        {!isSiteAlreadyOptimized && (
                          <div className={breakdownVersionCard}>
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
                              Format: { image.optimized?.format }
                            </p>
                            <p>
                              Size: { formatBytes(image.optimized?.size) || '-' }
                            </p>
                            <p>
                              Carbon: { formatGrams(image.optimized?.co2, { fixed: 3 }) }
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="text-left [&_h3]:mb-1 [&_h3]:text-[2em] [&_h3]:font-bold [&_ul]:m-0 [&_ul]:list-none [&_ul]:p-0">
                        {isImageAlreadyOptimized && (
                          <>
                            <h3>Nice work!</h3>
                            <p>
                              Looks like you are already optimizing this image.
                            </p>
                          </>
                        )}
                        {!isImageAlreadyOptimized && (
                          <>
                            <h3>You could save...</h3>

                            <p className="my-[0.2em] text-[2em] font-bold [&_strong]:text-brand-yellow">
                              <strong>{ formatBytes(estimatedSizeSavings, { limit: 1500 }) || '-' }</strong> = <strong>{ formatGrams(estimatedCarbonSavings, { fixed: 2, type: 'kg', limit: 1500 }) }</strong>
                            </p>

                            <p>
                              with { addCommas(requestsYearly) } yearly requests.
                            </p>

                            <p className="mt-[0.8em] text-[2em] font-bold [&_strong]:text-brand-yellow">By...</p>

                            <ul className="mt-2 list-none p-0 text-[1.5em]">
                              <li>
                                Optimizing Images
                              </li>
                            </ul>
                          </>
                        )}
                      </div>
                    </div>

                    <ul className={breakdownUrlsList}>
                      <li className="mb-2 grid last:mb-0">
                        <p className="m-0 overflow-hidden text-ellipsis whitespace-nowrap">
                          Original: <a href={image?.original.url} title={image?.original.url}>{ image?.original.url }</a>
                        </p>
                      </li>
                      <li className="mb-2 grid last:mb-0">
                        <p className="m-0 overflow-hidden text-ellipsis whitespace-nowrap">
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
              <SectionText className="mt-20" size="tiny" color="note">
                <strong>{ numberHiddenImages }</strong> images not shown due to deduplication or smaller than { formatBytes(MIN_IMAGE_SIZE) } in size.
              </SectionText>
            )}
          </Container>
        </Section>
        {accomplishments?.length > 0 && (
          <Section>
            <Container>
              <SectionTitle as="h3">
                What you&apos;re doing right...
              </SectionTitle>

              <ul className="m-0 list-none space-y-4 p-0">
                {accomplishments && accomplishments.map(accomplishment => {
                  return (
                    <li key={accomplishment}>
                      <SectionText size="small">
                        { accomplishment }
                      </SectionText>
                    </li>
                  )
                })}
              </ul>

            </Container>
          </Section>
        )}
        {improvements?.length > 0 && (
          <Section>
            <Container>
              <SectionTitle as="h3">
                What Else You Could be Doing...
              </SectionTitle>

              <ul className="m-0 list-none space-y-4 p-0">
                {improvements && improvements.map(improvement => {
                  return (
                    <li key={improvement}>
                      <SectionText size="small">
                        { improvement }
                      </SectionText>
                    </li>
                  )
                })}
              </ul>
            </Container>
          </Section>
        )}

        <Section>
          <Container>
            <SectionTitle as="h2">
              More Resources to Learn
            </SectionTitle>

            <ul className="my-12 grid list-none grid-cols-1 gap-8 px-12 md:grid-cols-3 md:px-0">
              <li className="relative">
                <a
                  className="no-underline hover:underline"
                  href="https://www.thegreenwebfoundation.org/"
                  rel="noopener"
                >
                  <CldImage
                    src="imagecarbon-assets/green-web-foundation_guapln"
                    width="800"
                    height="600"
                    alt="The Green Web Foundation"
                  />
                </a>
                <SectionText size="tiny">
                  Towards a fossil free internet by 2030
                </SectionText>
              </li>
              <li className="relative">
                <a
                  className="no-underline hover:underline"
                  href="https://almanac.httparchive.org/en/2022/sustainability#evaluating-the-environmental-impact-of-websites"
                  rel="noopener"
                >
                  <CldImage
                    src="imagecarbon-assets/http-archive-sustainability_ynumgy"
                    width="800"
                    height="600"
                    alt="Rainforest with results as JPEG"
                  />
                </a>
                <SectionText size="tiny">
                  Environmental impact of websites
                </SectionText>
              </li>
              <li className="relative">
                <a
                  className="no-underline hover:underline"
                  href="https://cloudinary.com/state-of-visual-media-report?going-green&utm_source=imagecarbon.com&utm_medium=referral&utm_campaign=devx_imagecarbon&utm_content=stateofvisualmedia"
                >
                  <CldImage
                    src="imagecarbon-assets/state-of-visual-media_zrpykz"
                    width="800"
                    height="600"
                    alt="Cloudinary State of Visual Media"
                  />
                </a>
                <SectionText size="tiny">
                  Going Green with Image and Video Optimization
                </SectionText>
              </li>
            </ul>

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

  const { images: cacheImages, dateCollected, screenshot } = await getCache({ siteUrl });

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
      dateCollected: dateCollected.toISOString(),
      dateCollectedFormatted: formatDate(dateCollected),
      screenshot: screenshot ? JSON.parse(screenshot) : null
    }
  }
}