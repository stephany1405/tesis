import React from 'react';
import Modelo from "../modelo.jsx";
import useQuiropodiaServices from "../data/productosQuiropodia.jsx";
import { useParams } from 'react-router-dom';

const Corporales = () => {
  const { categoryID } = useParams();
  const { serviciosQuiropodia, loading } = useQuiropodiaServices(categoryID);
  //Stephany Modificar lo de loading para que en vez de que sea un P, sea un spinner de cargando en el medio de la pantalla lo que dure la carga.
  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Modelo title="Servicios Quiropodia" products={serviciosQuiropodia} />
    </>
  );
};

export default Corporales
