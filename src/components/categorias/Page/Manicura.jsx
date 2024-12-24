import React from "React";
import Modelo from "../modelo.jsx";
import useManiServices from "../data/productosManicura.jsx";
import { useParams } from 'react-router-dom';

const Manicura = () => {
  const { categoryID } = useParams();
  const { serviciosManicura, loading } = useManiServices(categoryID);
  //Stephany Modificar lo de loading para que en vez de que sea un P, sea un spinner de cargando en el medio de la pantalla lo que dure la carga.
  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Modelo title="Manicura" products={serviciosManicura} />
    </>
  );
};

export default Manicura
