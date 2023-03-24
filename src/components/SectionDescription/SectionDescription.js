import styles from './SectionDescription.module.scss';

const SectionDescription = ({ children, className, weight = "normal", size = "normal", color = "normal" }) => {
  let SectionDescriptionClassName = styles.SectionDescription;

  if ( className ) {
    SectionDescriptionClassName = `${SectionDescriptionClassName} ${className}`;
  }

  return (
    <p className={SectionDescriptionClassName} data-text-weight={weight} data-text-size={size} data-text-color={color}>
      {children}
    </p>
  );
}

export default SectionDescription;
