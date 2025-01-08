import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./desplegableC.module.css";
import { useCart } from "./useContext";

export function DesplegableC() {
  const { cartItems, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const hideTimeoutRef = useRef(null);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleVerBolsa = () => {
    navigate("/bolsa");
  };

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setIsDropdownVisible(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setIsDropdownVisible(false);
    }, 1000); // Retraso de 300ms antes de ocultar el recuadro
  };

  return (
    <div
      className={styles.dropdownContainer}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={styles.dropdownButton}
      >
        Carrito ({cartItems.length})
      </button>
      {isDropdownVisible && (
        <div
          className={styles.dropdownContent}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {cartItems.length > 0 ? (
            <>
              <ul className={styles.cartItems}>
                {cartItems.map((item) => (
                  <li key={item.id} className={styles.cartItem}>
                    <span>{item.title}</span>
                    <span>
                      {item.quantity} x ${item.price}
                    </span>
                    <button onClick={() => removeFromCart(item.id)}>
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
              <div className={styles.cartTotal}>
                <span>Total: ${total.toFixed(2)}</span>
              </div>
              <button
                className={styles.viewCartButton}
                onClick={handleVerBolsa}
              >
                Ver Bolsa
              </button>
            </>
          ) : (
            <p>El carrito está vacío</p>
          )}
        </div>
      )}
    </div>
  );
}

export default DesplegableC;