import React, { useState, useEffect } from "react";
import styles from "./status.module.css";
import { Check, Star } from "lucide-react";
import axios from "axios";
import { getJWT } from "../middlewares/getToken.jsx";
import { jwtDecode } from "jwt-decode";

function Status({ data, onStatusUpdate }) {
  const [currentStep, setCurrentStep] = useState(() => {
    const storedStep = localStorage.getItem(
      `currentStep_${data.appointment_id}`
    );
    return 0;
  });
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);

  const steps = [
    { label: "Aceptaste el servicio", status: "Especialista asignado" },
    { label: "En camino", status: "En camino" },
    { label: "Inicio del servicio", status: "Inicio del servicio" },
    { label: "Final del servicio", status: "Final del servicio" },
  ];
  useEffect(() => {
    // Reset current step when appointment_id changes
    setCurrentStep(0);
    localStorage.removeItem(`currentStep_${data.appointment_id}`);
  }, [data.appointment_id]);

  useEffect(() => {
    if (currentStep === steps.length - 1) {
      setShowRating(true);
    }
  }, [currentStep]);

  const handleRatingSubmit = async () => {
    if (!rating) {
      return alert("Por favor, ingrese una calificación");
    }
    if (!data.appointment_id) {
      return alert("ID de cita inválido");
    }

    try {
      const token = getJWT("token");
      const decodedToken = jwtDecode(token);
      console.log("Decoded Token:", decodedToken); // Ver el decodedToken
      const payload = {
        appointmentId: data.appointment_id,
        rating: rating,
        role: decodedToken.role_id,
        userId: decodedToken.id,
      };
      console.log(payload);

      await axios.post(
        "http://localhost:3000/api/servicios/calificaciones/crear",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Send final status update after rating
      await axios.post(
        "http://localhost:3000/api/servicios/actualizar-estado",
        {
          appointmentId: data.appointment_id,
          status: "Final del servicio",
          specialistId: decodedToken.id,
        }
      );

      setCurrentStep(steps.length - 1);
      setShowRating(false);
      alert("Calificación enviada exitosamente");
    } catch (error) {
      console.error("Full error details:", error.response?.data || error);
      alert(
        `Error al enviar la calificación: ${error.response?.data?.error || error.message
        }`
      );
    }
  };

  const handleStepClick = async (index) => {
    if (index <= currentStep + 1) {
      try {
        const token = getJWT("token");
        const decodedToken = jwtDecode(token);

        await axios.post(
          "http://localhost:3000/api/servicios/actualizar-estado",
          {
            appointmentId: data.appointment_id,
            status: steps[index].status,
            specialistId: decodedToken.id,
          }
        );

        setCurrentStep(index);

        if (index === steps.length - 1) {
          setShowRating(true);
        }

        if (onStatusUpdate) {
          onStatusUpdate(steps[index].status);
        }
      } catch (error) {
        console.error(
          "Error al actualizar el estado:",
          error.response?.data || error
        );
        alert("Error al actualizar el estado del servicio");
      }
    }
  };

  return (
    <div className={styles.statusContainer}>
      {steps.map((step, index) => (
        <div
          key={index}
          className={`${styles.statusItem} ${index <= currentStep ? styles.completed : ""
            }`}
          onClick={() => handleStepClick(index)}
        >
          <div className={styles.checkContainer}>
            <Check className={styles.checkIcon} />
          </div>
          <div className={styles.statusContent}>
            <p className={styles.statusLabel}>{step.label}</p>
          </div>
        </div>
      ))}

      {showRating && (
        <div className={styles.ratingContainer}>
          <p className={styles.ratingTitle}>Califica tu experiencia</p>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`${styles.star} ${star <= rating ? styles.active : ""
                  }`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <button
            className={styles.button}
            onClick={handleRatingSubmit}
            disabled={rating === 0}
          >
            Enviar
          </button>
        </div>
      )}
    </div>
  );
}

export default Status;
