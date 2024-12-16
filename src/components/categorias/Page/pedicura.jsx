import Modelo from "../modelo"
import productosPedicura from "../data/productosPedicura";

const Pedicura = () => {
    return (
      <>
        <Modelo title="Manicura" products={productosPedicura} />
        
        
        </>
  );
};

export default Pedicura;