import React from 'react';
import styles from "./Inicio.module.css";
import Carrusel from './Carrusel';
import CategoriasList from './CategoriasList';

const photos = [
  { src: '/imagenes/cara(4).jpeg' },
  { src: '/imagenes/cara(3).jpeg' },
  { src: '/imagenes/cara(2).jpeg' },
  { src: '/imagenes/cara(1).jpeg' },
];

const categorias = [
  {
    id: 1,
    name: 'Tratamientos faciales',
    imageUrl: '/placeholder.svg',
    link: '/servicios/faciales'
  },
  {
    id: 2,
    name: 'Tratamientos corporales',
    imageUrl: '/placeholder.svg',
    link: '/servicios/corporales'
  },
  {
    id: 3,
    name: 'Manicura',
    imageUrl: '/placeholder.svg',
    link: '/servicios/manicura'
  },
  {
    id: 4,
    name: 'Extensiones de pestañas',
    imageUrl: '/placeholder.svg',
    link: '/servicios/pestanas'
  },
  {
    id: 5,
    name: 'Pedicura',
    imageUrl: '/placeholder.svg',
    link: '/servicios/pedicura'
  },
  {
    id: 6,
    name: 'Quiropodia',
    imageUrl: '/placeholder.svg',
    link: '/servicios/quiropodia'
  },
  {
    id: 7,
    name: 'Epilación con cera',
    imageUrl: '/placeholder.svg',
    link: '/servicios/epilacion'
  }
];

const Inicio = () => {
  return (
    <>
      <header className={styles.header}>
        <a href="/" className={styles.logo}>uñimas</a>
        <nav className={styles.nav}>
          <a href="/catalogo" className={styles.navItem}>Catálogo</a>
          <a href="/agenda" className={styles.navItem}>Agenda</a>
          <a href="/perfil" className={styles.navItem}>Carrito</a>
          <a href="/perfil" className={styles.navItem}>Perfil</a>
        </nav>
      </header>
      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        <Carrusel images={photos} autoPlayInterval={6000} />
      </div>
      <div className="App">
        <CategoriasList categorias={categorias} />
      </div>
    </>
  );
};

export default Inicio;

