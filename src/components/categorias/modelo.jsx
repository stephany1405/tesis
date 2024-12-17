import React, { useState } from 'react';
import styles from './modelo.module.css';
import Header from '../inicio/header';
import ProductModal from './product-modal';

const ProductCard = ({ product }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div key={product.id} className={styles.card}>
        <div className={styles.header}>
          {product.image && (
            <img 
              src={product.image} 
              alt={product.title}
              className={styles.productImage}
            />
          )}
        </div>
        <h3 className={styles.productTitle}>{product.title}</h3>
        <p className={styles.description}>{product.description}</p>
        <div className={styles.price}>${product.price}</div>
        <button 
          className={styles.addButton}
          onClick={() => setIsModalOpen(true)}
        >
          +
        </button>
      </div>
      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
      />
    </>
  );
};

const Modelo = ({ title, products }) => {
  const groupedProducts = products.some(item => item.title && Array.isArray(item.products));

  return (
    <>
      <div>
        <Header />
      </div>
      <h1 className={styles.title}>{title}</h1>
      {groupedProducts ? (
        products.map((group, index) => (
          <div key={index} className={styles.group}>
            {group.title && <h2 className={styles.groupTitle}>{group.title}</h2>}
            <div className={styles.container}>
              {group.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className={styles.container}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
};

export default Modelo;

