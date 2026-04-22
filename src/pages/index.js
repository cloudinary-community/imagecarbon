import { CldImage } from 'next-cloudinary';
import { FaLink, FaSearch, FaChartPie, FaImage } from 'react-icons/fa';

import Layout from '@/components/Layout';
import Section from '@/components/Section';
import Container from '@/components/Container';
import SectionTitle from '@/components/SectionTitle';
import SectionText from '@/components/SectionText';
import FormSubmitWebsite from '@/components/FormSubmitWebsite';
import { HERO_GLOW, HERO_INNER } from '@/lib/heroClasses';

const tagBase =
  'absolute -right-4 -top-4 flex h-16 w-16 flex-col items-center justify-center rounded-full border-2 border-[rgb(26,26,26)] bg-black text-[1.2em] text-white shadow-[0_2px_10px_#242423]';
const tagRed = 'bg-ui-red border-[rgb(225,96,96)]';
const tagYellow = 'bg-brand-yellow text-brand-gray-dark border-[rgb(243,220,156)]';
const tagGreen = 'bg-ui-green border-[rgb(44,162,1)]';

export default function Home() {
  return (
    <Layout>
      <Section className={HERO_GLOW}>
        <Container className={HERO_INNER} size="narrow">
          <SectionTitle>
            What&apos;s the <strong>carbon</strong> footprint of the <strong>images</strong> on your website?
          </SectionTitle>

          <SectionText>
            Enter your website address and we&apos;ll calculate how much carbon that page is emitting from images.
          </SectionText>

          <FormSubmitWebsite id="home-hero-website" className="mt-10" />
        </Container>
      </Section>

      <Section className="mt-4">
        <Container className={HERO_INNER} size="narrow">
          <SectionTitle as="h2">Why images?</SectionTitle>

          <SectionText size="small">
            Using the web inherently consumes energy. That energy results in CO2 emissions that contribute to global
            issues like climate change.
          </SectionText>

          <figure className="mx-auto my-0 max-w-[40em]">
            <CldImage
              width="1200"
              height="742"
              src="https://res.cloudinary.com/jen-demos/image/upload/v1776825378/number-of-bytes-by-percentile-by-type-mobile_fwbgmn.webp"
              alt="Graph showing that images are by far the highest contributor to number of bytes transferred on the web."
            />
            <figcaption className="mt-[0.8em] text-center text-sm">
              <a
                className="text-ui-note no-underline hover:underline"
                href="https://almanac.httparchive.org/en/2022/sustainability#carbon-emissions"
              >
                https://almanac.httparchive.org/en/2022/sustainability#carbon-emissions
              </a>
            </figcaption>
          </figure>

          <SectionText size="small">
            While calculating the full extent of the impact your website is having is important, digital assets like
            images and videos are typically a large portion of the byte sent over the wire.
          </SectionText>
        </Container>
      </Section>

      <Section>
        <Container className={HERO_INNER} size="narrow">
          <SectionTitle as="h2">What can we do about it?</SectionTitle>

          <SectionText size="small">
            First step is recognizing the problem, but there are several low-effort ways to greatly reduce the size of
            your images.
          </SectionText>

          <SectionText size="small">
            To start, modern image formats like AVIF, WebP, and JPEG XL offer better image quality and compression
            ratios than legacy formats.
          </SectionText>

          <ul className="mx-0 my-12 grid list-none grid-cols-1 gap-8 px-12 md:grid-cols-3 md:px-0">
            <li className="relative">
              <CldImage
                src="rainforest"
                width={1118}
                height={722}
                format="jpg"
                alt="Rainforest with results as JPEG"
              />
              <span className={`${tagBase} ${tagRed}`} data-color="red">
                <span className="block text-center font-bold leading-none">JPG</span>
                <span className="block text-center text-[0.9em] leading-none">2.7mb</span>
              </span>
            </li>
            <li className="relative">
              <CldImage
                src="rainforest"
                width={1118}
                height={722}
                format="webp"
                alt="Rainforest with results as JPEG"
              />
              <span className={`${tagBase} ${tagYellow}`} data-color="yellow">
                <span className="block text-center font-bold leading-none">WebP</span>
                <span className="block text-center text-[0.9em] leading-none">1.7mb</span>
              </span>
            </li>
            <li className="relative">
              <CldImage
                src="rainforest"
                width={1118}
                height={722}
                format="avif"
                alt="Rainforest with results as JPEG"
              />
              <span className={`${tagBase} ${tagGreen}`} data-color="green">
                <span className="block text-center font-bold leading-none">AVIF</span>
                <span className="block text-center text-[0.9em] leading-none">874kb</span>
              </span>
            </li>
          </ul>

          <div className="text-inherit text-ui-note">
            <ul className="m-0 list-none p-0 leading-normal">
              <li>
                <a className="text-ui-note no-underline hover:underline" href="https://unsplash.com/photos/_qZ0us4az20">
                  JPG based on original 4475x2889 image from unsplash.com
                </a>
              </li>
            </ul>
          </div>

          <SectionText>
            <strong>
              <a href="https://almanac.httparchive.org/en/2022/sustainability#format-webpavif" rel="noopener">
                99.88% of images are not being sent in the optimal format!
              </a>
            </strong>
          </SectionText>

          <SectionText size="small">
            Imagine how much energy and carbon could be saved if the entire world started using those formats and
            optimized their images.
          </SectionText>
        </Container>
      </Section>

      <Section>
        <Container className={HERO_INNER} size="narrow">
          <SectionTitle as="h2">How do I check my website?</SectionTitle>

          <SectionText size="small">
            Submit your website at the top of bottom of this page and we&apos;ll do the work to figure out the impact
            the images on your website are having on the environment.
          </SectionText>

          <ul className="mx-auto my-0 max-w-[25em] list-none space-y-8 px-0 text-left text-base md:text-2xl">
            <li className="flex items-center">
              <span className="mr-4 flex h-10 w-10 shrink-0 grow-0 items-center justify-center rounded-full bg-brand-yellow text-brand-gray-dark">
                <FaLink aria-hidden="true" />
              </span>
              <span className="inline-block">Enter your website address.</span>
            </li>
            <li className="flex items-center">
              <span className="mr-4 flex h-10 w-10 shrink-0 grow-0 items-center justify-center rounded-full bg-brand-yellow text-brand-gray-dark">
                <FaSearch aria-hidden="true" />
              </span>
              <span className="inline-block">
                We&apos;ll find the images by rendering the page and parsing the result.
              </span>
            </li>
            <li className="flex items-center">
              <span className="mr-4 flex h-10 w-10 shrink-0 grow-0 items-center justify-center rounded-full bg-brand-yellow text-brand-gray-dark">
                <FaChartPie aria-hidden="true" />
              </span>
              <span className="inline-block">
                <a href="https://developers.thegreenwebfoundation.org/co2js/overview/" rel="noopener">
                  CO2.js from The Green Web Foundation
                </a>{' '}
                will tell us how much carbon is being emitted.
              </span>
            </li>
            <li className="flex items-center">
              <span className="mr-4 flex h-10 w-10 shrink-0 grow-0 items-center justify-center rounded-full bg-brand-yellow text-brand-gray-dark">
                <FaImage />
              </span>
              <span className="inline-block">We&apos;ll see how much CO2 you can reduce by optimizing your images</span>
            </li>
          </ul>
        </Container>
      </Section>

      <Section>
        <Container className={HERO_INNER} size="narrow">
          <SectionTitle as="h2">Calculate your emissions!</SectionTitle>

          <SectionText>
            Start your journey to a more sustainable future by determining the impact your website images are having on
            the environment.
          </SectionText>

          <FormSubmitWebsite id="home-footer-website" className="mt-10" />
        </Container>
      </Section>
    </Layout>
  );
}
