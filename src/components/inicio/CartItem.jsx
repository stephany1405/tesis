import styles from "../bolsa/bolsa.module.css"

export const CartItem = ({ item, index, onQuantityChange, onRemove }) => {
  return (
    <div className={styles.item}>
      <div className={styles.itemDetails}>
        <h3>{item.title}</h3>
        <div className={styles.itemVariant}>Duración: {item.duration} cada una</div>
        <div className={styles.itemDescription}>
          <strong>Nota:</strong> {item.note || "Sin nota"}
        </div>
        <div className={styles.itemActions}>
          <select
            value={item.quantity}
            onChange={(e) => onQuantityChange(index, Number.parseInt(e.target.value, 10))}
            className={styles.quantitySelect}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? "sesión" : "sesiones"}
              </option>
            ))}
          </select>
          <span className={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</span>
          <button className={styles.removeButton} onClick={() => onRemove(index)}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

