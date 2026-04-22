import { cn } from '@/lib/cn';

const sizeClasses = {
  normal:
    'my-4 text-center text-[1.2em] sm:text-[1.5em] md:text-[2em] xl:px-12',
  small: 'my-[1.2em] text-center text-base sm:text-[1.2em] md:text-[1.8em]',
  tiny: 'my-4 text-center text-[0.8em] sm:text-base md:text-2xl',
};

const colorClasses = {
  normal: '',
  white: 'text-white',
  note: 'text-ui-note',
};

const weightClasses = {
  normal: 'font-normal',
  semibold: 'font-semibold',
  bold: 'font-bold',
  black: 'font-black',
};

const SectionText = ({ children, className, weight = 'normal', size = 'normal', color = 'normal' }) => {
  return (
    <p
      className={cn(
        'text-center [&_strong]:font-[inherit] [&_strong]:text-brand-yellow',
        sizeClasses[size],
        colorClasses[color] || undefined,
        weightClasses[weight],
        className
      )}
    >
      {children}
    </p>
  );
};

export default SectionText;
