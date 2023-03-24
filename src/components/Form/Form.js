import styles from './Form.module.scss';

const Form = ({ children, className, ...rest }) => {

  let formClassName = styles.form;

  if ( className ) {
    formClassName = `${formClassName} ${className}`;
  }

  return (
    <form className={formClassName} {...rest}>
      {children}
    </form>
  );
};

export default Form;
