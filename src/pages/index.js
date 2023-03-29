import Head from 'next/head'
import { CldImage } from 'next-cloudinary'
import { FaLink, FaSearch, FaChartPie, FaImage } from 'react-icons/fa';

import Layout from '@/components/Layout';
import Section from '@/components/Section';
import Container from '@/components/Container';
import SectionTitle from '@/components/SectionTitle';
import SectionDescription from '@/components/SectionDescription';
import FormSubmitWebsite from '@/components/FormSubmitWebsite';

import styles from '@/styles/Home.module.scss'

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Image Carbon</title>
        <meta name="description" content="Image Carbon" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Section>
        <Container className={styles.homeContainer} size="narrow">
          <SectionTitle>
            What&apos;s the <strong>carbon</strong> footprint of the <strong>images</strong> on your website?
          </SectionTitle>
          
          <SectionDescription>
            Enter your website address and we&apos;ll estimate how much carbon your website is emitting from images.
          </SectionDescription>
          
          <FormSubmitWebsite className={styles.homeWebsiteSubmit} />
        </Container>
      </Section>

      <Section>
        <Container className={styles.homeContainer} size="narrow">
          <SectionTitle as="h2">
            Why images?
          </SectionTitle>
          
          <SectionDescription size="small">
            Using the web inherently consumes energy. That energy results in CO2 emissions that contribute to global issues like climate change.
          </SectionDescription>
          
          <figure>
            <CldImage
              width="1200"
              height="742"
              src="https://almanac.httparchive.org/static/images/2022/sustainability/carbon-emissions-by-percentile.png"
              deliveryType="fetch"
              alt="Graph showing that images are by far the highest contributor to number of bytes transferred on the web."
            />
            <figcaption className={styles.caption}>
              <a href="https://almanac.httparchive.org/en/2022/sustainability#carbon-emissions">
                https://almanac.httparchive.org/en/2022/sustainability#carbon-emissions
              </a>
            </figcaption>
          </figure>
          
          <SectionDescription size="small">
            While calculating the full extent of the impact your website is having is important, digital assets like images and videos are typically a large portion of the byte sent over the wire.
          </SectionDescription>
        </Container>
      </Section>
      
      <Section>
        <Container className={styles.homeContainer} size="narrow">
          <SectionTitle as="h2">
            What can we do about it?
          </SectionTitle>
          
          <SectionDescription size="small">
            First step is recognizing the problem, but there are several low-effort ways to greatly reduce the size of your images.
          </SectionDescription>

          <SectionDescription size="small">
            To start, modern image formats like AVIF, WebP, and JPEG XL offer better image quality and compression ratios than legacy formats. 
          </SectionDescription>
          
          <ul>
            <li>
              JPG 300kb
            </li>
            <li>
              WebP 200kb
            </li>
            <li>
              AVIF 100kb
            </li>
          </ul>
          
          <SectionDescription size="small">
            <strong>99.88% of images are not being sent in the optimal format!</strong> Imagine how much energy and carbon could be saved if the entire world started using those formats and optimized their images.
          </SectionDescription>
        </Container>
      </Section>
      
      <Section>
        <Container className={styles.homeContainer} size="narrow">
          <SectionTitle as="h2">
            How do I check my website?
          </SectionTitle>
          
          <SectionDescription size="small">
            Submit your website at the top of bottom of this page and we&apos;ll do the work to figure out the impact the images on your website are having on the environment.
          </SectionDescription>

          <ul>
            <li>
              <FaLink /> Enter your website address.
            </li>
            <li>
              <FaSearch /> We&apos;ll find the images by rendering the page and parsing the result.
            </li>
            <li>
              <FaChartPie /> CO2.js from The Green Web Foundation will tell us how much carbon is being emitted.
            </li>
            <li>
              <FaImage /> We&apos;ll see how much CO2 you can reduce by optimizing your images
            </li>
          </ul>
        </Container>
      </Section>



      <Section>
        <Container className={styles.homeContainer} size="narrow">
          <SectionTitle as="h2">
            Calculate your emissions!
          </SectionTitle>
          
          <SectionDescription>
            Start your journey to a more sustainable future by determining the impact your website images are having on the environment.
          </SectionDescription>
          
          <FormSubmitWebsite className={styles.homeWebsiteSubmit} />
        </Container>
      </Section>

    </Layout>
  )
}
