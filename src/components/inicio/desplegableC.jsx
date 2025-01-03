import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DesplegableC.module.css';
import  { useState } from 'react';

export function DesplegableC() {
  const navigate = useNavigate();
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

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleVerBolsa = () => {
    navigate('/bolsa');
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  return (
    <div className={styles.dropdown}>
      {cartItems.length > 0 ? (
        <>
          <div className={styles.items}>
            {cartItems.map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemDetails}>
                  <span className={styles.name}>{item.name}</span>
                  <div className={styles.quantityPrice}>
                    <span>Cantidad: {item.quantity}</span>
                    <span className={styles.price}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
                <button className={styles.removeButton} onClick={() => removeFromCart(item.id)}>
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className={styles.total}>
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button className={styles.button} onClick={handleVerBolsa}>
            VER BOLSA ({cartItems.length})
          </button>
        </>
      ) : (
        <div className={styles.emptyCart}>
          <p>Tu bolsa está vacía</p>
        </div>
      )}
    </div>
  );
}
