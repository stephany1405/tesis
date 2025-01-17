import React from 'react';
import styles from './Agenda.module.css';
import Status from './status';

function Agenda() {
  return (
    <div className={styles.container}>
      <h2 className={styles.mainTitle}>Detalles del Servicio</h2>
      <div className={styles.twoColumnLayout}>
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Estatus del Servicio</h3>
          <Status />
        </div>
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Información de la Agenda</h3>
          <div className={styles.infoContainer}>
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
        </div>
      </div>
    </div>
  );
}

export default Agenda;

