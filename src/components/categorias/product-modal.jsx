import React, { useState, useEffect } from 'react';
import styles from './product.module.css';

const ProductModal = ({ isOpen, onClose, product }) => {
  const [note, setNote] = useState("");

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleAddToBag = () => {
    // Add to cart logic here
    console.log("Added to bag with note:", note);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        <h2 className={styles.modalTitle}>{product.title}</h2>
        <div className={styles.modalBody}>
          <div className={styles.imageContainer}>
            <img src={product.image} alt={product.title} className={styles.productImage} />
          </div>
          <div className={styles.productInfo}>
            <h3 className={styles.productTitle}>{product.title}</h3>
            <p className={styles.productDescription}>{product.description}</p>
            <p className={styles.productDuration}>Duración: {product.time}</p>
            <div className={styles.productPrice}>${product.price}</div>
          </div>
          <div className={styles.noteContainer}>
            <label htmlFor="note" className={styles.noteLabel}>
              Agregar nota:
            </label>
            <textarea
              id="note"
              placeholder="Escribe una nota para este servicio..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={styles.noteTextarea}
            />
          </div>
          <button onClick={handleAddToBag} className={styles.addButton}>
            Agregar a la bolsa
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;

