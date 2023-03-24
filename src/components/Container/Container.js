import styles from './Container.module.scss';

const Container = ({ children, className, size = 'full', ...rest }) => {
  let containerClassName = styles.container;

  if (className) {
    containerClassName = `${containerClassName} ${className}`;
  }

  return (
    <div className={containerClassName} data-container-size={size} {...rest}>
      {children}
    </div>
  );
};

export default Container;