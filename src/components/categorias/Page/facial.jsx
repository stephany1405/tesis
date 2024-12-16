import Modelo from "../modelo"
import productosFaciales from "../data/productosFaciales";

const Facial = () => {
    return (
      <>
        <Modelo title="Tratamientos Faciales" products={productosFaciales} />
        
        
        </>
  );
};

export default Facial;