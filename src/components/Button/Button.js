import Link from 'next/link';

import { cn } from '@/lib/cn';

const buttonStyles =
  'inline-flex cursor-pointer items-center justify-center rounded border-2 border-[rgb(243,220,156)] bg-brand-yellow px-[1.2em] py-[0.8em] text-center font-[inherit] text-base font-bold text-brand-gray-darker no-underline shadow-button transition-colors hover:bg-[rgb(242,216,146)] active:bg-[rgb(233,191,73)] disabled:cursor-default disabled:bg-[rgb(242,216,146)] disabled:text-brand-gray-darker/50 disabled:opacity-60';

const Button = ({ children, href, className, ...rest }) => {
  const buttonClassName = cn(buttonStyles, className);

  const buttonProps = {
    className: buttonClassName,
    ...rest,
  };

  if (href) {
    if (href.startsWith('/')) {
      return (
        <Link href={href} {...buttonProps}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} rel="noreferrer noopener" {...buttonProps}>
        {children}
      </a>
    );
  }

  return <button {...buttonProps}>{children}</button>;
};

export default Button;
