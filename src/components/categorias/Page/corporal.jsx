import React from 'react';
import Modelo from "../modelo.jsx";
import useCorporalesServices from "../data/productosCorporales.jsx";
import { useParams } from 'react-router-dom';

const Corporales = () => {
  const { categoryID } = useParams();
  const { serviciosCorporales, loading } = useCorporalesServices(categoryID);
  //Stephany Modificar lo de loading para que en vez de que sea un P, sea un spinner de cargando en el medio de la pantalla lo que dure la carga.
  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Modelo title="Servicios Corporales" products={serviciosCorporales} />
    </>
  );
};

export default Corporales
