import styles from "./Modal.module.css"

const Modal = ({ isOpen, onClose, title, children, onConfirm }) => {
  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>{title}</h2>
        <div className={styles.modalBody}>{children}</div>
        <div className={styles.buttonContainer}>
          <button onClick={onConfirm} className={styles.confirmButton}>
            Aceptar
          </button>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default Modal

