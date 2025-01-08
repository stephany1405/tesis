'use client'

import React, { useState } from 'react';
import styles from './bolsa.module.css';
import Header from './header';
import { useCart } from './useContext';

const Bolsa = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const [selectedItems, setSelectedItems] = useState(cartItems.map(() => true));

  const subtotal = cartItems.reduce((sum, item, index) => 
    sum + (selectedItems[index] ? item.price * item.quantity : 0), 0
  );

  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  const handleQuantityChange = (index, newQuantity) => {
    updateQuantity(cartItems[index].id, parseInt(newQuantity));
  };

  const handleCheckboxChange = (index) => {
    const updatedSelectedItems = [...selectedItems];
    updatedSelectedItems[index] = !updatedSelectedItems[index];
    setSelectedItems(updatedSelectedItems);
  };

  const handleSelectAll = () => {
    setSelectedItems(selectedItems.map(() => true));
  };

  const handleRemoveItem = (index) => {
    removeFromCart(cartItems[index].id);
  };

  return (
    <>
      <div className={styles.bolsaContainer}>
        <div className={styles.bolsaContent}>
          <div className={styles.bolsaItems}>
            <div className={styles.itemsHeader}>
              <h2>SERVICIOS SELECCIONADOS ({cartItems.length})</h2>
              <button className={styles.selectAllButton} onClick={handleSelectAll}>
                Seleccionar Todo
              </button>
            </div>

            {cartItems.map((item, index) => (
              <div key={index} className={styles.item}>
                <input
                  type="checkbox"
                  checked={selectedItems[index]}
                  onChange={() => handleCheckboxChange(index)}
                  className={styles.itemCheckbox}
                />
                <div className={styles.itemDetails}>
                  <h3>{item.title}</h3>
                  <div className={styles.itemVariant}>Duración: {item.duration}</div>
                  <div className={styles.itemActions}>
                    <select
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                      className={styles.quantitySelect}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'sesión' : 'sesiones'}
                        </option>
                      ))}
                    </select>
                    <span className={styles.itemPrice}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      className={styles.removeButton}
                      onClick={() => handleRemoveItem(index)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.orderSummary}>
            <h2>Resumen De Servicios</h2>
            
            <div className={styles.summaryDetails}>
              <div className={styles.summaryRow}>
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>IVA:</span>
                <span>${iva.toFixed(2)}</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button className={styles.payButton}>
              RESERVAR AHORA ({cartItems.filter((_, index) => selectedItems[index]).length})
            </button>

            <div className={styles.paymentMethods}>
              <p>Métodos de pago aceptados:</p>
              <div className={styles.paymentIcons}>
                <div className={styles.paymentIcon}>Pago con Tarjeta</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Bolsa;