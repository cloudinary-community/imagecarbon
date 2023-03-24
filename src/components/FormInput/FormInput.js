import styles from './FormInput.module.scss';

const FormInput = ({ ...rest }) => {
  return (
    <input className={styles.formInput} {...rest} />
  );
};

export default FormInput;
