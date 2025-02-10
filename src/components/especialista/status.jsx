import React, { useState, useEffect } from "react";
import styles from "./status.module.css";
import { Check, Star } from "lucide-react";
import axios from "axios";
import { getJWT } from "../middlewares/getToken.jsx";
import { jwtDecode } from "jwt-decode";
import { useWebSocketContext } from "../agenda/WebSocketContext.jsx";

function Status({ data, onStatusUpdate }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const { ws, isConnected } = useWebSocketContext();

  const steps = [
    { label: "Aceptaste el servicio", status: "Especialista asignado" },
    { label: "En camino", status: "En camino" },
    { label: "Inicio del servicio", status: "Inicio del servicio" },
    { label: "Final del servicio", status: "Final del servicio" },
  ];

  useEffect(() => {
    if (isConnected && ws) {
      const handleMessage = (message) => {
        if (
          message.type === "STATUS_UPDATE" &&
          Number(message.data.appointmentId) === data.appointment_id
        ) {
          const stepIndex = steps.findIndex(
            (step) => step.status === message.data.status
          );
          if (stepIndex !== -1) {
            setCurrentStep(stepIndex);
            localStorage.setItem(
              `currentStep_${data.appointment_id}`,
              stepIndex
            );
            if (stepIndex === steps.length - 1) {
              setShowRating(true);
            }
          }
        }
      };

      ws.onmessage = (e) => {
        try {
          const parsedMessage = JSON.parse(e.data);
          handleMessage(parsedMessage);
        } catch (error) {
          console.error(
            "Error al analizar el mensaje de WebSocket:",
            error,
            e.data
          );
        }
      };
    }

    return () => {
      if (ws) {
        ws.onmessage = null;
      }
    };
  }, [isConnected, ws, data.appointment_id, steps]);

  useEffect(() => {
    const storedStep = localStorage.getItem(
      `currentStep_${data.appointment_id}`
    );

    if (storedStep !== null) {
      setCurrentStep(Number(storedStep));
    } else {
      const fetchInitialStatus = async () => {
        if (!data.appointment_id) {
          console.error("Invalido appointment_id:", data.appointment_id);
          return;
        }

        try {
          const token = getJWT("token");
          const decodedToken = jwtDecode(token);
          const specialistId = decodedToken.id;

          const response = await axios.get(
            `http://localhost:3000/api/servicios/especialista-estado/${data.appointment_id}/${specialistId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.data && response.data.status) {
            const initialStatusId = response.data.status;

            const classificationResponse = await axios.get(
              `http://localhost:3000/api/servicios/classification/${initialStatusId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const initialStatus =
              classificationResponse.data.classification_type;

            const stepIndex = steps.findIndex(
              (step) => step.status === initialStatus
            );
            if (stepIndex !== -1) {
              setCurrentStep(stepIndex);
              localStorage.setItem(
                `currentStep_${data.appointment_id}`,
                stepIndex
              );
            }
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log(
              "Estado no encontrado para esta cita y especialista. Configuración del estado predeterminado."
            );
            localStorage.setItem(`currentStep_${data.appointment_id}`, "0");
          } else {
            console.error("Error al obtener el estado inicial:", error);
          }
        }
      };

      fetchInitialStatus();
    }
  }, [data.appointment_id, steps]);

  useEffect(() => {
    if (currentStep === steps.length - 1) {
      setShowRating(true);
    }
  }, [currentStep, steps.length]);

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
      const payload = {
        appointmentId: data.appointment_id,
        rating: rating,
        role: decodedToken.role_id,
        userId: decodedToken.id,
      };

      await axios.post(
        "http://localhost:3000/api/servicios/calificaciones/crear",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await axios.post(
        "http://localhost:3000/api/servicios/actualizar-estado",
        {
          appointmentId: data.appointment_id,
          status: "Final del servicio",
          specialistId: decodedToken.id,
        }
      );

      setCurrentStep(steps.length - 1);
      localStorage.setItem(
        `currentStep_${data.appointment_id}`,
        steps.length - 1
      );
      setShowRating(false);
      alert("Calificación enviada exitosamente");
    } catch (error) {
      console.error("Full error details:", error.response?.data || error);
      alert(
        `Error al enviar la calificación: ${
          error.response?.data?.error || error.message
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
        localStorage.setItem(`currentStep_${data.appointment_id}`, index);

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
          className={`${styles.statusItem} ${
            index <= currentStep ? styles.completed : ""
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
                className={`${styles.star} ${
                  star <= rating ? styles.active : ""
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
