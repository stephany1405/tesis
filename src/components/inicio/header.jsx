<<<<<<< HEAD
import React from "react";
import styles from "./header.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3000/api/usuario/logout");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <header className={styles.header}>
      <a href="/" className={styles.logo}>uñimas</a>
      <nav className={styles.nav}>
        <a href="/catalogo" className={styles.navItem}>Catálogo</a>
        <a href="/agenda" className={styles.navItem}>Agenda</a>
        <a href="/perfil" className={styles.navItem}>Carrito</a>
        <a href="/perfil" className={styles.navItem}>Perfil</a>
        <button className={styles.navItem} onClick={handleLogout}>
          Cerrar Sesión
        </button>
=======
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { DesplegableC } from './desplegableC';
import styles from './Header.module.css';

const Header = () => {
  const [showCart, setShowCart] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>uñimas</Link>
      <nav className={styles.nav}>
        <Link to="/catalogo" className={styles.navItem}>Catálogo</Link>
        <Link to="/agenda" className={styles.navItem}>Agenda</Link>
        <div 
          className={styles.cartContainer}
          onMouseEnter={() => setShowCart(true)}
          onMouseLeave={() => setShowCart(false)}
        >
          <span 
            className={styles.navItem}
            onClick={() => navigate('/bolsa')}
            style={{ cursor: 'pointer' }}
          >
            Carrito
          </span>
          {showCart && location.pathname !== '/bolsa' && <DesplegableC />}
        </div>
        <Link to="/perfil" className={styles.navItem}>Perfil</Link>
>>>>>>> 9dfa6364e97d5b90445affaa0753b9d91fe89f5d
      </nav>
    </header>
  );
};

export default Header;
<<<<<<< HEAD
=======

>>>>>>> 9dfa6364e97d5b90445affaa0753b9d91fe89f5d
