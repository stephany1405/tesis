import React from 'react';
import Modelo from "../modelo.jsx";
import useExtensionesServices from "../data/productosExtension.jsx";
import { useParams } from 'react-router-dom';

const Extensiones = () => {
  const { categoryID } = useParams();
  const { serviciosExtensiones, loading } = useExtensionesServices(categoryID);
  //Stephany Modificar lo de loading para que en vez de que sea un P, sea un spinner de cargando en el medio de la pantalla lo que dure la carga.
  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Modelo title="Servicios Extensiones" products={serviciosExtensiones} />
    </>
  );
};

export default Extensiones
