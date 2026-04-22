const inputClassName =
  'inline-block w-full rounded border-2 border-brand-gray-light bg-white px-[1.4em] py-4 text-base shadow-input outline-none placeholder:text-ui-note hover:bg-white focus:border-brand-yellow focus:shadow-input-focus';

const FormInput = ({ type, name, placeholder, id, label, onChange }) => {
  return (
    <>
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <input
        className={inputClassName}
        type={type}
        name={name}
        placeholder={placeholder}
        id={id}
        onChange={onChange}
      />
    </>
  );
};

export default FormInput;
