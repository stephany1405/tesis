import Modelo from "../modelo"
import productosManicura from "../data/productosManicura";

const Manicura = () => {
    return (
      <>
        <Modelo title="Manicura" products={productosManicura} />
        
        </>
  );
};

export default Manicura;