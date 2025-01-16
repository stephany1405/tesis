import React from 'react';
import styles from './agenda.module.css';

export default function agenda() {
  return (

    <div className={styles.infoContainer}>
      <h2 className={styles.infoTitle}>Estatus</h2>
      
      <div className={styles.infoGroup}>
        <p className={styles.infoLabel}>Servicio:</p>
        <p className={styles.infoValue}>Tratamiento facial rejuvenecedor</p>
      </div>

      <div className={styles.infoGroup}>
        <p className={styles.infoLabel}>Sesiones:</p>
        <p className={styles.infoValue}>3</p>
      </div>

      <div className={styles.infoGroup}>
        <p className={styles.infoLabel}>Duración:</p>
        <p className={styles.infoValue}>60 minutos</p>
      </div>

      <div className={styles.infoGroup}>
        <p className={styles.infoLabel}>Descripción:</p>
        <p className={styles.infoDescription}>
          Tratamiento intensivo que combina limpieza profunda, exfoliación, 
          mascarilla nutritiva y masaje facial para revitalizar y rejuvenecer la piel.
        </p>
      </div>

      <div className={styles.infoGroup}>
        <p className={styles.infoLabel}>Fecha:</p>
        <p className={styles.infoValue}>15 de mayo de 2023</p>
      </div>

      <div className={styles.infoGroup}>
        <p className={styles.infoLabel}>Hora:</p>
        <p className={styles.infoValue}>14:30</p>
      </div>

      <div className={styles.infoGroup}>
        <p className={styles.infoLabel}>Ubicación:</p>
        <p className={styles.infoValue}>Calle Principal 123, Local 4, Ciudad</p>
      </div>

      <div className={styles.infoGroup}>
        <p className={styles.infoLabel}>Forma de Pago:</p>
        <p className={styles.infoValue}>Tarjeta de Crédito</p>
      </div>
    </div>
  );
}

