import { cn } from '@/lib/cn';

const sizeMax = {
  full: 'max-w-page',
  narrow: 'max-w-narrow',
  content: 'max-w-content',
};

const Container = ({ children, className, size = 'full', ...rest }) => {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-page px-4 md:px-8',
        size !== 'full' && sizeMax[size],
        '[&_h2:first-child]:mt-0 [&_h3:first-child]:mt-0 [&_h4:first-child]:mt-0 [&_p:first-child]:mt-0 [&_ul:first-child]:mt-0',
        '[&_h2:last-child]:mb-0 [&_h3:last-child]:mb-0 [&_h4:last-child]:mb-0 [&_p:last-child]:mb-0 [&_ul:last-child]:mb-0',
        className
      )}
      data-container-size={size}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Container;
