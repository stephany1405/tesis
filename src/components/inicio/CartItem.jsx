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
  const calculateTotalDuration = (duration, quantity) => {
    const durationParts = duration.split(" ");
    let hours = 0;
    let minutes = 0;

    for (let i = 0; i < durationParts.length; i++) {
      const value = parseInt(durationParts[i]);
      if (isNaN(value)) continue;

      if (durationParts[i + 1]?.includes("hora")) {
        hours = value;
        i++;
      } else if (durationParts[i + 1]?.includes("minuto")) {
        minutes = value;
        i++;
      }
    }

    const totalMinutes = (hours * 60 + minutes) * quantity;
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    let result = "";
    if (totalHours > 0) {
      result += `${totalHours} ${totalHours === 1 ? "hora" : "horas"}`;
    }
    if (remainingMinutes > 0) {
      if (result) result += " ";
      result += `${remainingMinutes} ${
        remainingMinutes === 1 ? "minuto" : "minutos"
      }`;
    }
    return result || "0 minutos";
  };

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
        <div className={styles.itemVariant}>Duración: {item.duration} cada una</div>
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
