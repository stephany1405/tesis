import React, { useEffect, useState } from 'react';
import styles from './categorias.module.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CategoriasList = () => {
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/servicios/categoria');
        const transformedCategorias = response.data.map((category) => ({
          id: category.id,
          name: category.classification_type,
          imageUrl: category.service_image,   
          link: `/servicios/${category.classification_type.toLowerCase()}/${category.id}`,
        }));
        setCategorias(transformedCategorias);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategorias();
  }, []);

  const centralizeLastThree = categorias.slice(-3);

  return (
    <div className={styles.container}>
      <div className={styles.categoriesWrapper}>
        {categorias.slice(0, categorias.length - 3).map((category) => (
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
            <p className={styles.categoryDescription}>{category.description}</p>
          </Link>
        ))}
      </div>

      {/* Centralizing last 3 categories */}
      <div className={styles.centralizedWrapper}>
        {centralizeLastThree.map((category) => (
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
            <p className={styles.categoryDescription}>{category.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriasList;
