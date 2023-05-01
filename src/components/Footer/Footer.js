import Section from '@/components/Section';
import SectionTitle from '@/components/SectionTitle';
import SectionText from '@/components/SectionText';
import Button from '@/components/Button';
import Container from '@/components/Container';
import LogoCloudinary from '@/components/LogoCloudinary';
import LogoXata from '@/components/LogoXata';
import LogoScrapingBee from '@/components/LogoScrapingBee';
import LogoNextjs from '@/components/LogoNextjs';
import LogoVercel from '@/components/LogoVercel';

import styles from './Footer.module.scss';

const Footer = ({ ...rest }) => {
  return (
    <>
      <Section>
        <Container size="content" className={styles.cloudinaryContainer}>
          <p className={styles.cloudinaryLogo}>
            <a href="https://cloudinary.com/?utm_source=imagecarbon.com&utm_medium=referral&utm_campaign=devx_imagecarbon&utm_content=footer_cloudinary_logo">
              <span className="sr-only">Cloudinary</span>
              <LogoCloudinary />
            </a>
          </p>
          <SectionText className={styles.cloudinaryText}>
            Easy optimization and delivery for all of your digital assets!
          </SectionText>
          <a className={styles.cloudinaryGetStarted} href="https://cloudinary.com/developers?utm_source=imagecarbon.com&utm_medium=referral&utm_campaign=devx_imagecarbon&utm_content=footer_cloudinary_learnmore">
            Learn More
          </a>
        </Container>
      </Section>
      <footer className={styles.footer} {...rest}>
        <Container className={`${styles.footerContainer} ${styles.footerLegal}`}>
          <div className={styles.builtWith}>
            <p>
              Built by <a href="https://twitter.com/colbyfayock" rel="noreferrer noopener">Colby Fayock</a> with
            </p>
            <ul className={styles.builtWithLogos}>
              <li>
                <a href="https://cloudinary.com/?utm_source=imagecarbon.com&utm_medium=referral&utm_campaign=devx_imagecarbon&utm_content=footer_builtwith">
                  <span className="sr-only">Cloudinary</span>
                  <LogoCloudinary />
                </a>
              </li>
              <li>
                <a href="https://xata.io/" rel="noopener">
                  <span className="sr-only">Xata</span>
                  <LogoXata />
                </a>
              </li>
              <li>
                <a href="https://www.scrapingbee.com/" rel="noopener">
                  <span className="sr-only">ScrapingBee</span>
                  <LogoScrapingBee />
                </a>
              </li>
              <li>
                <a href="https://nextjs.org/" rel="noopener">
                  <span className="sr-only">Next.js</span>
                  <LogoNextjs />
                </a>
              </li>
              <li>
                <a href="https://vercel.com/ambassador/colby-fayock" rel="noopener">
                  <span className="sr-only">Vercel</span>
                  <LogoVercel />
                </a>
              </li>
            </ul>
          </div>
          <p className={styles.note}>
            This site does not collect or store any personal information.
          </p>
          <p className={styles.note}>
            For questions or more information, contact community@cloudinary.com.
          </p>
        </Container>
      </footer>
    </>
  );
};

export default Footer;
