import Link from 'next/link';
import { FaGithub } from 'react-icons/fa';

import Container from '@/components/Container';

const Header = () => {
  return (
    <header className="relative z-[999] flex h-12 w-full items-center text-base text-brand-gray-light sm:h-16">
      <Container className="flex w-full items-center justify-between">
        <p className="m-0 text-[1.6em] font-bold">
          <Link className="inline-flex items-center justify-center no-underline" href="/">
            Image Carbon
          </Link>
        </p>
        <ul className="m-0 ml-8 flex list-none items-center justify-center p-0 first:ml-0 last:mr-0 sm:mx-8">
          <li className="mx-[0.8em] first:ml-0 last:mr-0">
            <a
              className="inline-flex items-center justify-center no-underline"
              href="https://github.com/colbyfayock/imagecarbon"
              rel="noreferrer"
              aria-label="Visit the Image Carbon repo on Github"
            >
              <FaGithub className="mr-[0.4em] text-[1.2em]" aria-hidden="true" />
            </a>
          </li>
        </ul>
      </Container>
    </header>
  );
};

export default Header;
