import React from "react";

const Bienvenida = () => {
  const styles = {
    container: {
      backgroundColor: "#e6f7ff", // Azul muy claro
      padding: "20px",
      borderRadius: "8px",
      textAlign: "center",
      fontFamily: "Verdana, sans-serif",
      boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.2)",
    },
    title: {
      color: "#0056b3", // Azul oscuro
      marginBottom: "10px",
      fontSize: "2em",
    },
    subtitle: {
      color: "#007bff",
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Bienvenido Especialista</h1>
      <p style={styles.subtitle}>Listo para gestionar tus citas.</p>
    </div>
  );
};

export default Bienvenida;
