import React from "react";
import "./CheckSuccess.css";

const ThankYouPage = () => {
  return (
    <div className="thank-you-container">
      <div className="thank-you-card">
        <h1>¡Gracias por elegirnos!</h1>
        <p>
          Agradecemos que hayas solicitado nuestros servicios. Estamos
          emocionados de servirte y esperamos que tu experiencia sea excelente.
        </p>
        <button
          className="return-button"
          onClick={() => (window.location.href = "/inicio")}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default ThankYouPage;
