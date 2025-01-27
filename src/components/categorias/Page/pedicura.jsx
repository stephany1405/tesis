import React from 'react';
import Modelo from "../modelo.jsx";
import usePedicuraServices from "../data/productosPedicura.jsx";
import { useParams } from 'react-router-dom';

const Extensiones = () => {
  const { categoryID } = useParams();
  const { serviciosPedicura, loading } = usePedicuraServices(categoryID);
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
