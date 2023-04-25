import styles from './SectionTitle.module.scss';

const SectionTitle = ({ className: classNameOverride, children, as: Component = 'h1' }) => {
  let className = styles.SectionTitle;

  if ( classNameOverride ) {
    className = `${className} ${classNameOverride}`
  }

  return (
    <Component className={className}>
      {children}
    </Component>
  );
}

export default SectionTitle;
