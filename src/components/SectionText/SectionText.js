import styles from './SectionText.module.scss';

const SectionText = ({ children, className, weight = "normal", size = "normal", color = "normal" }) => {
  let SectionTextClassName = styles.SectionText;

  if ( className ) {
    SectionTextClassName = `${SectionTextClassName} ${className}`;
  }

  return (
    <p className={SectionTextClassName} data-text-weight={weight} data-text-size={size} data-text-color={color}>
      {children}
    </p>
  );
}

export default SectionText;
