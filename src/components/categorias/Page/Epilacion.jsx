import React from 'react';
import Modelo from "../modelo.jsx";
import useEpilacionServices from "../data/productosEpilacion.jsx";
import { useParams } from 'react-router-dom';

const Epilacion = () => {
  const { categoryID } = useParams();
  const { serviciosEpilaciones, loading } = useEpilacionServices(categoryID);
  //Stephany Modificar lo de loading para que en vez de que sea un P, sea un spinner de cargando en el medio de la pantalla lo que dure la carga.
  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Modelo title="Servicios Depilaciones" products={serviciosEpilaciones} />
    </>
  );
};

export default Epilacion
