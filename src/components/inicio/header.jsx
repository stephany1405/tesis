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
      </nav>
    </header>
  );
};

export default Header;

