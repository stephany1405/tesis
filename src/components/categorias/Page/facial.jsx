import React from 'react';
import Modelo from "../modelo.jsx";
import useFacialServices from "../data/productosFaciales.jsx";
import { useParams } from 'react-router-dom';

const Facial = () => {
  const { categoryID } = useParams();
  const { serviciosFaciales, loading } = useFacialServices(categoryID);
  //Stephany Modificar lo de loading para que en vez de que sea un P, sea un spinner de cargando en el medio de la pantalla lo que dure la carga.
  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Modelo title="Servicios faciales" products={serviciosFaciales} />
    </>
  );
};

export default Facial
