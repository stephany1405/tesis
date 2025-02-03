import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X, ChevronRight } from "lucide-react";
import { useCart } from "./useContext";
import styles from "./DesplegableC.module.css";

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
    }, 300);
  };

  return (
    <div
      className={styles.dropdownContainer}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className={styles.cartButton}>
        <ShoppingCart size={20} />
        <span className={styles.cartCount}>{cartItems.length}</span>
      </button>
      <AnimatePresence>
        {isDropdownVisible && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={styles.dropdownContent}
          >
            {cartItems.length > 0 ? (
              <>
                <h3 className={styles.cartTitle}>Carrito de Compras</h3>
                <ul className={styles.cartItems}>
                  {cartItems.map((item) => (
                    <li key={item.uniqueId} className={styles.cartItem}>
                      <div className={styles.itemInfo}>
                        <span className={styles.itemTitle}>{item.title}</span>
                        <span className={styles.itemQuantity}>
                          {item.quantity} x ${item.price}
                        </span>
                      </div>
                      <button
                        className={styles.removeButton}
                        onClick={() => removeFromCart(item.uniqueId)}
                      >
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>

                <div className={styles.cartTotal}>
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <button
                  className={styles.viewCartButton}
                  onClick={handleVerBolsa}
                >
                  Ver Bolsa
                  <ChevronRight size={16} />
                </button>
              </>
            ) : (
              <p className={styles.emptyCart}>El carrito está vacío</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DesplegableC;
