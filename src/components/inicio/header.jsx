import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DesplegableC } from "./desplegableC";
import axios from "axios";
import styles from "./Header.module.css";

const Header = () => {
  const [showCart, setShowCart] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/usuario/logout"
      );

      if (response.status === 200) {
        console.log("Sesión cerrada correctamente.");
        navigate("/login");
      } else {
        console.error("Error al cerrar sesión:", response.data);
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };
  const [showServices, setShowServices] = useState(false);

  const toggleServices = () => {
    setShowServices(!showServices);
  };

  const toggleCart = () => {
    setShowCart(!showCart);
  };
  const services = [
    { name: 'Manicuras', path: '/servicios/manicuras/1' },
    { name: 'Corporales', path: '/servicios/corporales/2' },
    { name: 'Pedicura', path: '/servicios/pedicura/3' },
    { name: 'Extensiones', path: '/servicios/extension/4' },
    { name: 'Epilación', path: '/servicios/epilacion/5' },
    { name: 'Facial', path: '/servicios/facial/6' },
    { name: 'Quiropodia', path: '/servicios/quiropodia/7' },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Link to="/inicio" className={styles.logo}>
          uñimas
        </Link>
      </div>
      <nav className={styles.nav}>
        <Link to="/inicio" className={location.pathname === "/" ? styles.active : ""}>
          Inicio
        </Link>
        <div className={styles.dropdownContainer}>
          <span onClick={toggleServices} className={styles.dropdownButton}>
            Servicios
          </span>
          {showServices && (
            <div className={styles.dropdownContent}>
              {services.map((service, index) => (
                <Link key={index} to={service.path}>
                  {service.name}
                </Link>
              ))}
            </div>
          )}
          </div>
        
        <div className={styles.cartContainer}>
        <DesplegableC />
      </div> 
      <Link
          to="/perfil"
          className={location.pathname === "/perfil" ? styles.active : ""}
        >
          Perfil
        </Link>

        <button onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </nav>
      
    </header>
  );
};

export default Header;
