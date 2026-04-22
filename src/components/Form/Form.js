const Form = ({ children, className, ...rest }) => {
  const formClassName = ['w-full', className].filter(Boolean).join(' ');

  return (
    <form className={formClassName} {...rest}>
      {children}
    </form>
  );
};

export default Form;
