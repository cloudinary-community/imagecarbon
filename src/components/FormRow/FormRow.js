import styles from './FormRow.module.scss';

const FormRow = ({ children, className, ...rest }) => {
  let formRowClassName = styles.formRow;

  if ( className ) {
    formRowClassName = `${formRowClassName} ${className}`;
  }

  return (
    <div className={formRowClassName} {...rest}>
      {children}
    </div>
  );
};

export default FormRow;
