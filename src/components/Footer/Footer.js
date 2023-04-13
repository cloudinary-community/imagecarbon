import Container from '@/components/Container';
import LogoCloudinary from '@/components/LogoCloudinary';
import LogoXata from '@/components/LogoXata';
import LogoScrapingBee from '@/components/LogoScrapingBee';
import LogoNextjs from '@/components/LogoNextjs';
import LogoVercel from '@/components/LogoVercel';

import styles from './Footer.module.scss';

const Footer = ({ ...rest }) => {
  return (
    <footer className={styles.footer} {...rest}>
      <Container className={`${styles.footerContainer} ${styles.footerLegal}`}>
        <div className={styles.builtWith}>
          <p>
            Built by <a href="https://twitter.com/colbyfayock" rel="noreferrer noopener">Colby Fayock</a> with
          </p>
          <ul className={styles.builtWithLogos}>
            <li>
              <a href="https://cloudinary.com/?utm_source=imagecarbon.com&utm_medium=referral&utm_campaign=devx_imagecarbon&utm_content=footer">
                <LogoCloudinary />
              </a>
            </li>
            <li>
              <a href="https://xata.io/" rel="noopener">
                <LogoXata />
              </a>
            </li>
            <li>
              <a href="https://www.scrapingbee.com/" rel="noopener">
                <LogoScrapingBee />
              </a>
            </li>
            <li>
              <a href="https://nextjs.org/" rel="noopener">
                <LogoNextjs />
              </a>
            </li>
            <li>
              <a href="https://vercel.com/ambassador/colby-fayock" rel="noopener">
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
  );
};

export default Footer;
