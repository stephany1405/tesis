import Modelo from "../modelo"
import productosCorporales from "../data/productosCorporales";

const Corporal = () => {
    return (
      <>
        <Modelo title="Tratamientos corporales" products={productosCorporales} />
        
        
        </>
  );
};

export default Corporal;