'use client'

import React, { useState } from 'react';
import styles from './bolsa.module.css';
import Header from './header';

const Bolsa = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Tratamiento Facial Completo",
      price: 45.99,
      duration: "60 min",
      quantity: 1
    },
    {
      id: 2,
      name: "Manicure y Pedicure",
      price: 32.99,
      duration: "45 min",
      quantity: 1
    },
    {
      id: 3,
      name: "Masaje Relajante",
      price: 55.99,
      duration: "90 min",
      quantity: 1
    }
  ]);
  const [selectedItems, setSelectedItems] = useState(cartItems.map(() => true));

  const subtotal = cartItems.reduce((sum, item, index) => 
    sum + (selectedItems[index] ? item.price * item.quantity : 0), 0
  );
  const total = subtotal;

  const handleQuantityChange = (index, newQuantity) => {
    const updatedItems = [...cartItems];
    updatedItems[index].quantity = parseInt(newQuantity);
    setCartItems(updatedItems);
  };

  const handleCheckboxChange = (index) => {
    const updatedSelectedItems = [...selectedItems];
    updatedSelectedItems[index] = !updatedSelectedItems[index];
    setSelectedItems(updatedSelectedItems);
  };

  const handleSelectAll = () => {
    setSelectedItems(selectedItems.map(() => true));
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
                  <h3>{item.name}</h3>
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
                <div className={styles.paymentIcon}>Visa</div>
                <div className={styles.paymentIcon}>MC</div>
                <div className={styles.paymentIcon}>PayPal</div>
                <div className={styles.paymentIcon}>GPay</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Bolsa;
