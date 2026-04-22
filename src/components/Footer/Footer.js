import Section from '@/components/Section';
import Container from '@/components/Container';
import LogoCloudinary from '@/components/LogoCloudinary';
import LogoSupabase from '@/components/LogoSupabase';
import LogoNextjs from '@/components/LogoNextjs';

const Footer = ({ ...rest }) => {
  return (
    <>
      <Section>
        <Container size="content" className="text-center">
          <p className="mx-auto mb-0 inline-block w-full max-w-[18em] text-white [&_a]:block [&_a]:h-auto [&_a]:w-full [&_path]:fill-white [&_svg]:block [&_svg]:h-auto [&_svg]:w-full">
            <a href="https://cloudinary.com/?utm_source=imagecarbon.com&utm_medium=referral&utm_campaign=devx_imagecarbon&utm_content=footer_cloudinary_logo">
              <span className="sr-only">Cloudinary</span>
              <LogoCloudinary />
            </a>
          </p>
          <p className="m-0 px-0 py-0 text-center text-[1.65rem] font-normal leading-snug text-brand-eggshell md:text-[1.8em]">
            Easy optimization and delivery for all of your digital assets!
          </p>
          <a
            className="mt-4 inline-block text-center text-[1.6em] font-bold text-brand-yellow no-underline hover:underline"
            href="https://cloudinary.com/?utm_source=imagecarbon.com&utm_medium=referral&utm_campaign=devx_imagecarbon&utm_content=footer_cloudinary_learnmore"
          >
            Learn More
          </a>
        </Container>
      </Section>
      <footer className="w-full py-12 text-center text-white [&_a]:text-inherit" {...rest}>
        <Container className="mb-0 flex flex-col flex-wrap items-center justify-center sm:flex-wrap">
          <div className="my-8 text-center text-brand-eggshell [&_path]:fill-current [&_p]:mb-4 [&_p]:text-lg [&_p_a]:no-underline [&_p_a:hover]:underline [&_ul_a]:no-underline">
            <p>
              Built by{' '}
              <a href="https://x.com/colbyfayock" rel="noreferrer noopener">
                Colby Fayock
              </a>{' '}
              and revised by{' '}
              <a href="https://x.com/jenlooper" rel="noreferrer noopener">
                Jen Looper
              </a>{' '}
              with
            </p>
            <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-4 p-0">
              <li>
                <a href="https://cloudinary.com/?utm_source=imagecarbon.com&utm_medium=referral&utm_campaign=devx_imagecarbon&utm_content=footer_builtwith">
                  <span className="sr-only">Cloudinary</span>
                  <LogoCloudinary />
                </a>
              </li>
              <li>
                <a href="https://supabase.com/" rel="noopener">
                  <span className="sr-only">Supabase</span>
                  <LogoSupabase />
                </a>
              </li>
              <li>
                <a href="https://nextjs.org/" rel="noopener">
                  <span className="sr-only">Next.js</span>
                  <LogoNextjs />
                </a>
              </li>
              
            </ul>
          </div>
          <p className="m-0 mb-2 text-[0.9em] text-ui-note">
            This site does not collect or store any personal information.
          </p>
          <p className="m-0 text-[0.9em] text-ui-note">
            For questions or more information, contact devrel@cloudinary.com.
          </p>
        </Container>
      </footer>
    </>
  );
};

export default Footer;
