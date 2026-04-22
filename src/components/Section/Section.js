import { forwardRef } from 'react';

import { cn } from '@/lib/cn';

const Section = forwardRef(function Section(props, ref) {
  const { children, className, backgroundColor, ...rest } = props;

  return (
    <section
      ref={ref}
      className={cn('my-20 py-4 md:my-20 md:py-8', className)}
      data-background-color={backgroundColor}
      {...rest}
    >
      {children}
    </section>
  );
});

export default Section;
