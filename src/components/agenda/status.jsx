import React, { useState } from 'react';
import { Check, Star } from 'lucide-react';
import styles from './status.module.css';

function ServiceStatus() {
  const [currentStep, setCurrentStep] = useState(0);
  const [specialist, setSpecialist] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);

  const steps = [
    { label: 'Asignando especialista', time: '12:34 p.m.' },
    { label: 'Especialista asignado', time: '12:45 p.m.' },
    { label: 'En camino', time: '12:56 p.m.' },
    { label: 'Inicio del servicio', time: '01:13 p.m.' },
    { label: 'Final del servicio', time: '02:15 p.m.' }
  ];

  const handleStepClick = (index) => {
    if (index <= currentStep + 1) {
      setCurrentStep(index);
      
      if (index === 1 && !specialist) {
        setSpecialist({
          name: 'María González',
          rating: 4.8,
          photo: '/placeholder.svg?height=50&width=50'
        });
      }

      if (index === steps.length - 1) {
        setShowRating(true);
      }
    }
  };

  return (
    <div className={styles.statusContainer}>
      {steps.map((step, index) => (
        <div 
          key={index}
          className={`${styles.statusItem} ${index <= currentStep ? styles.completed : ''}`}
          onClick={() => handleStepClick(index)}
        >
          <div className={styles.checkContainer}>
            <Check className={styles.checkIcon} />
          </div>
          <div className={styles.statusContent}>
            <p className={styles.statusLabel}>{step.label}</p>
            {index === 1 && specialist && currentStep >= 1 && (
              <div className={styles.specialistInfo}>
                <img 
                  src={specialist.photo || "/placeholder.svg"} 
                  alt="Especialista" 
                  className={styles.specialistPhoto} 
                />
                <div>
                  <p className={styles.specialistName}>{specialist.name}</p>
                  <p className={styles.specialistRating}>★ {specialist.rating}</p>
                </div>
              </div>
            )}
            <p className={styles.statusTime}>{step.time}</p>
          </div>
        </div>
      ))}

      {showRating && (
        <div className={styles.ratingContainer}>
          <p className={styles.ratingTitle}>¡Gracias por elegirnos!</p>
          <p className={styles.ratingSubtitle}>Califica tu experiencia</p>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`${styles.star} ${star <= rating ? styles.active : ''}`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceStatus;

