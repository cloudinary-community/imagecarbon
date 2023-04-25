import { CldImage } from 'next-cloudinary'
import { FaLink, FaSearch, FaChartPie, FaImage } from 'react-icons/fa';

import Layout from '@/components/Layout';
import Section from '@/components/Section';
import Container from '@/components/Container';
import SectionTitle from '@/components/SectionTitle';
import SectionText from '@/components/SectionText';
import FormSubmitWebsite from '@/components/FormSubmitWebsite';

import styles from '@/styles/Home.module.scss'

export default function Home() {
  return (
    <Layout>
      <Section className={styles.homeHeroSection}>
        <Container className={styles.homeContainer} size="narrow">
          <SectionTitle>
            What&apos;s the <strong>carbon</strong> footprint of the <strong>images</strong> on your website?
          </SectionTitle>
          
          <SectionText>
            Enter your website address and we&apos;ll calculate how much carbon that page is emitting from images.
          </SectionText>
          
          <FormSubmitWebsite className={styles.homeWebsiteSubmit} />
        </Container>
      </Section>

      <Section>
        <Container className={styles.homeContainer} size="narrow">
          <SectionTitle as="h2">
            Why images?
          </SectionTitle>
          
          <SectionText size="small">
            Using the web inherently consumes energy. That energy results in CO2 emissions that contribute to global issues like climate change.
          </SectionText>
          
          <figure className={styles.emissionsImage}>
            <CldImage
              width="1200"
              height="742"
              src="https://almanac.httparchive.org/static/images/2022/sustainability/number-of-bytes-by-percentile-by-type-mobile.png"
              deliveryType="fetch"
              alt="Graph showing that images are by far the highest contributor to number of bytes transferred on the web."
            />
            <figcaption className={styles.caption}>
              <a href="https://almanac.httparchive.org/en/2022/sustainability#carbon-emissions">
                https://almanac.httparchive.org/en/2022/sustainability#carbon-emissions
              </a>
            </figcaption>
          </figure>
          
          <SectionText size="small">
            While calculating the full extent of the impact your website is having is important, digital assets like images and videos are typically a large portion of the byte sent over the wire.
          </SectionText>
        </Container>
      </Section>
      
      <Section>
        <Container className={styles.homeContainer} size="narrow">
          <SectionTitle as="h2">
            What can we do about it?
          </SectionTitle>
          
          <SectionText size="small">
            First step is recognizing the problem, but there are several low-effort ways to greatly reduce the size of your images.
          </SectionText>

          <SectionText size="small">
            To start, modern image formats like AVIF, WebP, and JPEG XL offer better image quality and compression ratios than legacy formats. 
          </SectionText>
          
          <ul className={styles.imageComparison}>
            <li>
              <CldImage
                src="imagecarbon-assets/rainforest"
                width="1118"
                height="722"
                alt="Rainforest with results as JPEG"
              />
              <span className={styles.imageComparisonTag} data-color="red">
                <span className={styles.imageComparisonTagFormat}>JPG</span>
                <span className={styles.imageComparisonTagSize}>2.7mb</span>
              </span>
            </li>
            <li>
              <CldImage
                src="imagecarbon-assets/rainforest"
                width="1118"
                height="722"
                alt="Rainforest with results as JPEG"
              />
              <span className={styles.imageComparisonTag} data-color="yellow">
                <span className={styles.imageComparisonTagFormat}>WebP</span>
                <span className={styles.imageComparisonTagSize}>1.7mb</span>
              </span>
            </li>
            <li>
              <CldImage
                src="imagecarbon-assets/rainforest"
                width="1118"
                height="722"
                alt="Rainforest with results as JPEG"
              />
              <span className={styles.imageComparisonTag} data-color="green">
                <span className={styles.imageComparisonTagFormat}>AVIF</span>
                <span className={styles.imageComparisonTagSize}>874kb</span>
              </span>
            </li>
          </ul>

          <div className={styles.imageComparisonSource}>
            <ul>
              <li>
                <a href="https://unsplash.com/photos/_qZ0us4az20">
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
            Imagine how much energy and carbon could be saved if the entire world started using those formats and optimized their images.
          </SectionText>
        </Container>
      </Section>
      
      <Section>
        <Container className={styles.homeContainer} size="narrow">
          <SectionTitle as="h2">
            How do I check my website?
          </SectionTitle>
          
          <SectionText size="small">
            Submit your website at the top of bottom of this page and we&apos;ll do the work to figure out the impact the images on your website are having on the environment.
          </SectionText>

          <ul className={styles.gettingStarted}>
            <li>
              <span className={styles.gettingStartedIcon}><FaLink /></span>
              <span className={styles.gettingStartedText}>Enter your website address.</span>
            </li>
            <li>
              <span className={styles.gettingStartedIcon}><FaSearch /></span>
              <span className={styles.gettingStartedText}>We&apos;ll find the images by rendering the page and parsing the result.</span>
            </li>
            <li>
              <span className={styles.gettingStartedIcon}><FaChartPie /></span>
              <span className={styles.gettingStartedText}>
                <a href="https://developers.thegreenwebfoundation.org/co2js/overview/" rel="noopener">CO2.js from The Green Web Foundation</a> will tell us how much carbon is being emitted.</span>
            </li>
            <li>
              <span className={styles.gettingStartedIcon}><FaImage /></span>
              <span className={styles.gettingStartedText}>We&apos;ll see how much CO2 you can reduce by optimizing your images</span>
            </li>
          </ul>
        </Container>
      </Section>



      <Section>
        <Container className={styles.homeContainer} size="narrow">
          <SectionTitle as="h2">
            Calculate your emissions!
          </SectionTitle>
          
          <SectionText>
            Start your journey to a more sustainable future by determining the impact your website images are having on the environment.
          </SectionText>
          
          <FormSubmitWebsite className={styles.homeWebsiteSubmit} />
        </Container>
      </Section>

    </Layout>
  )
}
