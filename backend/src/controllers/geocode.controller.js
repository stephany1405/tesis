import axios from "axios";

export const geolocation = async (req, res) => {
  try {
    const { q } = req.query;
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q,
          format: "json",
          limit: 5,
          countrycodes: "ve",
          addressdetails: 1,
        },
        headers: {
          "User-Agent": "unimas/1.0",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error en geocoding:", error);
    res.status(500).json({ error: "Error al buscar direcciones" });
  }
};

export const geocodificación = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat,
          lon,
          format: "json",
        },
        headers: {
          "User-Agent": "unimas/1.0",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error en reverse geocoding:", error);
    res.status(500).json({ error: "Error al obtener la dirección" });
  }
};
