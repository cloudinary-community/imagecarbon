import styles from './SectionDescription.module.scss';

const SectionDescription = ({ children, className, weight = "normal", size = "normal", color = "normal" }) => {
  let sectionDescriptionClassName = styles.SectionDescription;

  if ( className ) {
    sectionDescriptionClassName = `${sectionDescriptionClassName} ${className}`;
  }

  return (
    <p className={sectionDescriptionClassName} data-text-weight={weight} data-text-size={size} data-text-color={color}>
      {children}
    </p>
  );
}

export default SectionDescription;
