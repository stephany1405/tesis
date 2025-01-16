import React, { useState } from 'react';
import styles from './perfil.module.css';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    console.log("Modo de edición activado");
  };

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.title}>Perfil </h1>
      
      <div className={styles.section}>
        <h2>Información Personal</h2>
        <img src="/" alt="Foto de perfil" className={styles.profilePic} />
        <p><strong>Nombre:</strong> Juan</p>
        <p><strong>Apellido:</strong> Martinez</p>
        <p><strong>Identificación:</strong> 30429544</p>
      </div>

      <div className={styles.section}>
        <h2>Datos de Contacto</h2>
        <p><strong>Teléfono:</strong> 04242636770</p>
        <p><strong>Correo:</strong> j@example.com</p>
      </div>

      <div className={styles.section}>
        <h2>Historial de Servicios</h2>
        <ul className={styles.serviceList}>
          <li>Manicura - 22/06/2024</li>
          <li>Extensiones - 22/06/2024</li>
          <li>Masaje - 10/07/2024</li>
        </ul>
      </div>

      <button onClick={handleEdit} className={styles.editButton}>
        Modificar Información
      </button>
    </div>
  );
};

export default Profile;

