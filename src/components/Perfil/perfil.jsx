import React, { useState } from 'react';
import styles from './perfil.module.css';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('04242636770');
  const [profilePic, setProfilePic] = useState('/');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // Here you would typically send the updated data to your backend
      console.log("Saving changes:", { phoneNumber, profilePic });
      // Reset password fields
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handlePhoneChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Las contraseñas nuevas no coinciden");
      return;
    }
    // Here you would typically send the password change request to your backend
    console.log("Changing password");
    // Reset password fields
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.title}>Perfil</h1>
      
      <div className={styles.section}>
        <h2>Información Personal</h2>
        <img src={profilePic || "/placeholder.svg"} alt="Foto de perfil" className={styles.profilePic} />
        {isEditing && (
          <input type="file" onChange={handleImageChange} accept="image/*" className={styles.fileInput} />
        )}
        <p><strong>Nombre:</strong> Juan</p>
        <p><strong>Apellido:</strong> Martinez</p>
        <p><strong>Identificación:</strong> 30429544</p>
      </div>

      <div className={styles.section}>
        <h2>Datos de Contacto</h2>
        <p>
          <strong>Teléfono:</strong> 
          {isEditing ? (
            <input 
              type="tel" 
              value={phoneNumber} 
              onChange={handlePhoneChange}
              className={styles.input}
            />
          ) : phoneNumber}
        </p>
        <p><strong>Correo:</strong> j@example.com</p>
      </div>

      {isEditing && (
        <div className={styles.section}>
          <h2>Cambiar Contraseña</h2>
          <form onSubmit={handlePasswordChange}>
            <input
              type="password"
              placeholder="Contraseña actual"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Confirmar nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              required
            />
            <button type="submit" className={styles.passwordButton}>Cambiar Contraseña</button>
          </form>
        </div>
      )}

      <div className={styles.section}>
        <h2>Historial de Servicios</h2>
        <ul className={styles.serviceList}>
          <li>Manicura - 22/06/2024</li>
          <li>Extensiones - 22/06/2024</li>
          <li>Masaje - 10/07/2024</li>
        </ul>
      </div>

      <button onClick={handleEdit} className={styles.editButton}>
        {isEditing ? 'Guardar Cambios' : 'Modificar Información'}
      </button>
    </div>
  );
};

export default Profile;

