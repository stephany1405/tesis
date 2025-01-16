import axios from "axios";

export const getBCV = async (req, res) => {
  try {
    const response = await axios.get(
      "http://pydolarve.org/api/v1/dollar?page=bcv&monitor=usd"
    );
    const price = response.data.price;
    res.json({ price });
  } catch (error) {
    console.error("Error en consulta API DOLAR", error);
    res.status(500).json({ message: "Error al obtener el precio del dólar", error: error.message });
  }
};
