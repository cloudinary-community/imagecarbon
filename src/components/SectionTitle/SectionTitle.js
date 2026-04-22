import { cn } from '@/lib/cn';

const SectionTitle = ({ className: classNameOverride, children, as: Component = 'h1' }) => {
  return (
    <Component
      className={cn(
        'my-2 block text-center text-[2em] font-bold text-white sm:text-5xl md:text-[3.8em] [&_strong]:font-[inherit] [&_strong]:text-brand-yellow',
        classNameOverride
      )}
    >
      {children}
    </Component>
  );
};

export default SectionTitle;
