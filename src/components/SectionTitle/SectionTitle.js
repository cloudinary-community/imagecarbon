import styles from './SectionTitle.module.scss';

const SectionTitle = ({ children }) => {
  return (
    <h1 className={styles.SectionTitle}>
      {children}
    </h1>
  );
}

export default SectionTitle;
