import React from 'react';
import styles from './categorias.module.css';
import { Link } from 'react-router-dom';

const CategoriasList = ({ categorias }) => {
  return (
    <div className={styles.container}>
      <div className={styles.categoriesWrapper}>
        {categorias.map((category) => (
          <Link
            key={category.id} 
            to={category.link} 
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
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriasList;

