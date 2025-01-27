import React from 'react';
import Modelo from "../modelo.jsx";
import useManiServices from "../data/productosManicura.jsx";
import { useParams } from 'react-router-dom';

const Manicura = () => {
  const { categoryID } = useParams();
  const { serviciosManicura, loading } = useManiServices(categoryID);
  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Modelo title="Servicios Manicura" products={serviciosManicura} />
    </>
  );
};

export default Manicura
