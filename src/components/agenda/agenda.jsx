import React, { useState } from 'react';
import styles from './Agenda.module.css';
import Status from './status';
import Historial from './historial';

function Agenda() {
  const [selectedHistorialService, setSelectedHistorialService] = useState(null);

  const servicioActivo = {
    nombre: 'Tratamiento facial rejuvenecedor',
    sesiones: 3,
    duracion: '60 minutos',
    descripcion: 'Tratamiento intensivo que combina limpieza profunda, exfoliación, mascarilla nutritiva y masaje facial para revitalizar y rejuvenecer la piel.',
    fecha: '15 de mayo de 2023',
    hora: '14:30',
    ubicacion: 'Calle Principal 123, Local 4, Ciudad',
    formaPago: 'Tarjeta de Crédito',
    especialista: {
      nombre: 'María González',
      foto: '/placeholder.svg?height=50&width=50',
      calificacion: 4.8
    }
  };

  return (
    <div className={styles.mainContainer}>
     
      
      <div className={styles.contentLayout}>
        <div className={styles.leftColumn}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Servicios activos</h2>
            <div className={styles.sectionContent}>
              <Status />
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Información de agenda</h2>
            <div className={styles.sectionContent}>
              <div className={styles.infoGroup}>
                <p className={styles.infoLabel}>Servicio:</p>
                <p className={styles.infoValue}>{servicioActivo.nombre}</p>
              </div>
              <div className={styles.infoGroup}>
                <p className={styles.infoLabel}>Sesiones:</p>
                <p className={styles.infoValue}>{servicioActivo.sesiones}</p>
              </div>
              <div className={styles.infoGroup}>
                <p className={styles.infoLabel}>Duración:</p>
                <p className={styles.infoValue}>{servicioActivo.duracion}</p>
              </div>
              <div className={styles.infoGroup}>
                <p className={styles.infoLabel}>Descripción:</p>
                <p className={styles.infoDescription}>{servicioActivo.descripcion}</p>
              </div>
              <div className={styles.infoGroup}>
                <p className={styles.infoLabel}>Fecha:</p>
                <p className={styles.infoValue}>{servicioActivo.fecha}</p>
              </div>
              <div className={styles.infoGroup}>
                <p className={styles.infoLabel}>Hora:</p>
                <p className={styles.infoValue}>{servicioActivo.hora}</p>
              </div>
              <div className={styles.infoGroup}>
                <p className={styles.infoLabel}>Ubicación:</p>
                <p className={styles.infoValue}>{servicioActivo.ubicacion}</p>
              </div>
              <div className={styles.infoGroup}>
                <p className={styles.infoLabel}>Forma de Pago:</p>
                <p className={styles.infoValue}>{servicioActivo.formaPago}</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Historial de servicios</h2>
            <div className={styles.sectionContent}>
              <Historial setSelectedService={setSelectedHistorialService} />
            </div>
          </div>
        </div>
      </div>

      {selectedHistorialService && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Detalles del Servicio Realizado</h3>
            <div className={styles.modalInfo}>
              <div className={styles.infoGroup}>
                <p className={styles.infoLabel}>Servicio:</p>
                <p className={styles.infoValue}>{selectedHistorialService.nombre}</p>
              </div>
              <div className={styles.infoGroup}>
                <p className={styles.infoLabel}>Fecha:</p>
                <p className={styles.infoValue}>{selectedHistorialService.fecha}</p>
              </div>
              <div className={styles.infoGroup}>
                <p className={styles.infoLabel}>Duración:</p>
                <p className={styles.infoValue}>{selectedHistorialService.duracion}</p>
              </div>
              <div className={styles.infoGroup}>
                <p className={styles.infoLabel}>Descripción:</p>
                <p className={styles.infoDescription}>{selectedHistorialService.descripcion}</p>
              </div>
              <div className={styles.infoGroup}>
                <p className={styles.infoLabel}>Ubicación:</p>
                <p className={styles.infoValue}>{selectedHistorialService.ubicacion}</p>
              </div>
              <div className={styles.infoGroup}>
                <p className={styles.infoLabel}>Forma de Pago:</p>
                <p className={styles.infoValue}>{selectedHistorialService.formaPago}</p>
              </div>
              <div className={styles.specialistInfo}>
                <img 
                  src={selectedHistorialService.especialista.foto || "/placeholder.svg"} 
                  alt={selectedHistorialService.especialista.nombre} 
                  className={styles.specialistPhoto} 
                />
                <div>
                  <p className={styles.specialistName}>{selectedHistorialService.especialista.nombre}</p>
                  <p className={styles.specialistRating}>★ {selectedHistorialService.especialista.calificacion}</p>
                </div>
              </div>
            </div>
            <button className={styles.closeButton} onClick={() => setSelectedHistorialService(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Agenda;

