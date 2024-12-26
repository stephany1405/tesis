import React from 'react';
import Modelo from "../modelo.jsx";
import usePedicuraServices from "../data/productosPedicura.jsx";
import { useParams } from 'react-router-dom';

const Extensiones = () => {
  const { categoryID } = useParams();
  const { serviciosPedicura, loading } = usePedicuraServices(categoryID);
  //Stephany Modificar lo de loading para que en vez de que sea un P, sea un spinner de cargando en el medio de la pantalla lo que dure la carga.
  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Modelo title="Servicios Pedicura" products={serviciosPedicura} />
    </>
  );
};

export default Extensiones
