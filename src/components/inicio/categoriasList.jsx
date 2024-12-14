import React from 'react';
import styles from './categorias.module.css';


const CategoriasList = ({ categorias }) => {
  return (
    <div className={styles.container}>
      <div className={styles.categoriesWrapper}>
        {categorias.map((category) => (
          <a
            key={category.id} 
            href={category.link} 
            className={styles.categoryCard}
          >
            <div className={styles.imageContainer}>
              <img
                src={category.imageUrl}
                alt={category.name}
                className={styles.categoryImage}
              />
            </div>
            <h3 className={styles.categoryName}>{category.name}</h3>
          </a>
        ))}
      </div>
    </div>
  );
};

export default CategoriasList;
