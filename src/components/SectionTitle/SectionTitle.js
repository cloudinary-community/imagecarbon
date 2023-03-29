import styles from './SectionTitle.module.scss';

const SectionTitle = ({ children, as: Component = 'h1' }) => {
  return (
    <Component className={styles.SectionTitle}>
      {children}
    </Component>
  );
}

export default SectionTitle;
