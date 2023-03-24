import Head from 'next/head'
import { CldImage } from 'next-cloudinary'

import Layout from '@/components/Layout';
import Section from '@/components/Section';
import Container from '@/components/Container';
import SectionTitle from '@/components/SectionTitle';
import SectionDescription from '@/components/SectionDescription';
import FormSubmitWebsite from '@/components/FormSubmitWebsite';
import Button from '@/components/Button';

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

    </Layout>
  )
}
