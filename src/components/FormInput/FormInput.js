import styles from './FormInput.module.scss';

const FormInput = ({ type, name, placeholder, id, label, onChange }) => {
  return (
    <>
      <label className='sr-only' htmlFor={id}>
        {label}
      </label>
      <input className={styles.formInput} type={type} name={name} placeholder={placeholder} id={id} onChange={onChange} />
    </>
  );
};

export default FormInput;
