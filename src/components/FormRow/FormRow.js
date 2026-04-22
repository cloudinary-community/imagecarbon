import { cn } from '@/lib/cn';

const FormRow = ({ children, className, ...rest }) => {
  return (
    <div className={cn('mb-2 last:mb-0', className)} {...rest}>
      {children}
    </div>
  );
};

export default FormRow;
