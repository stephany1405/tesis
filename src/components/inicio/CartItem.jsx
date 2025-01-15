import React from "react";
import styles from "./bolsa.module.css";

export const CartItem = ({
  item,
  index,
  selected,
  onCheckboxChange,
  onQuantityChange,
  onRemove,
}) => {

  return (
    <div className={styles.item}>
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onCheckboxChange(index)}
        className={styles.itemCheckbox}
      />
      <div className={styles.itemDetails}>
        <h3>{item.title}</h3>
        <div className={styles.itemVariant}>Duración: {item.duration}</div>
        <div className={styles.itemDescription}>
          <strong>Nota:</strong> {item.note}
        </div>
        <div className={styles.itemActions}>
          <select
            value={item.quantity}
            onChange={(e) => onQuantityChange(index, e.target.value)}
            className={styles.quantitySelect}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? "sesión" : "sesiones"}
              </option>
            ))}
          </select>
          <span className={styles.itemPrice}>
            ${(item.price * item.quantity).toFixed(2)}
          </span>
          <button
            className={styles.removeButton}
            onClick={() => onRemove(index)}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};
