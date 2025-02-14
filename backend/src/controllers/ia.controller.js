import { pool } from "../db.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const getServicesData = async () => {
  try {
    const categoriesQuery = `
        SELECT id, classification_type AS name
        FROM classification
        WHERE service_category = true
      `;

    const servicesQuery = `
    SELECT 
    s.id, 
    s.classification_type AS name, 
    s.parent_classification_id AS category_id,
    c.classification_type AS category_name,
    s.id as classification_id,
    s.classification_type
FROM classification s
JOIN classification c ON s.parent_classification_id = c.id
WHERE s.service_category = false AND s.is_active = true;
      `;

    const [categoriesResult, servicesResult] = await Promise.all([
      pool.query(categoriesQuery),
      pool.query(servicesQuery),
    ]);

    return {
      categories: categoriesResult.rows,
      services: servicesResult.rows,
    };
  } catch (error) {
    throw new Error("Error al obtener datos de servicios");
  }
};

export const getCategoriesAndServices = async (req, res) => {
  try {
    const data = await getServicesData();
    const categorized = data.categories.map((category) => ({
      ...category,
      services: data.services.filter(
        (service) => service.category_id === category.id
      ),
    }));
    res.json({ categories: categorized });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const generateRecommendations = async (req, res) => {
  const { userId } = req.params;
  let allServices = [];

  try {
    const servicesData = await getServicesData();
    allServices = servicesData.services;

    const historyQuery = `
          SELECT services FROM appointment
          WHERE user_id = $1
        `;
    const historyResult = await pool.query(historyQuery, [userId]);

    const userServices = historyResult.rows
      .flatMap((row) => JSON.parse(row.services))
      .map((service) => service.id)
      .filter((id, index, self) => self.indexOf(id) === index);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let greetingPrompt;

    if (userServices.length === 0) {
      greetingPrompt = `Eres un asistente amigable de un salón de belleza.
            Genera un saludo corto (máximo 30 palabras) para un nuevo usuario.
            Dale la bienvenida y expresa entusiasmo por su primera visita.
            El saludo debe ser diferente cada vez, creativo y entusiasta. Evita frases repetitivas o genéricas.
            NO INCLUYAS NINGUN TIPO DE LISTA, SOLO EL SALUDO.
            NO USES NOMBRES DE USUARIO NI NOMBRES DE SALONES, sé genérico pero amigable.
            `;
    } else {
      const serviceNames = userServices
        .map((serviceId) => {
          const service = allServices.find((s) => s.id === serviceId);
          return service ? service.name : null;
        })
        .filter((name) => name !== null);

      const historyContext =
        serviceNames.length > 0
          ? `El usuario ha disfrutado previamente de: ${serviceNames.join(
              ", "
            )}.`
          : "";

      greetingPrompt = `
              Eres un asistente amigable de un salón de belleza.
              Genera un saludo corto (máximo 30 palabras) y personalizado para un usuario que ha reservado servicios recientemente.
              ${historyContext}
              El saludo debe ser diferente cada vez, creativo y entusiasta.  Sé creativo y entusiasta.
              NO menciones los IDs de los servicios.  Usa el historial de servicios SOLO como contexto, NO lo incluyas directamente en el saludo visible.
              NO INCLUYAS NINGUN TIPO DE LISTA, SOLO EL SALUDO.
              NO USES NOMBRES DE USUARIO NI NOMBRES DE SALONES, sé genérico pero amigable.
            `;
    }

    const greetingResult = await model.generateContent(greetingPrompt);
    const greetingText = (await greetingResult.response).text();
    const cleanGreeting = greetingText.replace(/```/g, "").trim();

    if (userServices.length === 0) {
      return getPopularServices(res, allServices, cleanGreeting);
    }

    const recommendationPrompt = `
    Eres un recomendador de servicios de belleza. 
    Historial del usuario: ${JSON.stringify(userServices)}
    Catálogo completo (con nombres de servicios y categorías): ${JSON.stringify(
      allServices
    )}

    Recomienda EXCLUSIVAMENTE 3 servicios relevantes del catálogo en formato JSON válido,
    usando este formato: [{"id": 1}, {"id": 2}, {"id": 3}].  Debes incluir el id del servicio.
    Considera:
    1. Servicios relacionados con los que el usuario ya ha usado
    2. Servicios complementarios
    3. Servicios populares si no hay suficientes recomendaciones
    NO INCLUYAS NINGÚN TEXTO EXTRA NI COMENTARIOS (ni siquiera el saludo)
  `;

    const result = await model.generateContent(recommendationPrompt);
    const responseText = (await result.response).text();

    const cleanResponse = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const response = JSON.parse(cleanResponse);

    if (!Array.isArray(response)) {
      throw new Error("Formato de respuesta inválido");
    }

    const recommendedServices = allServices
      .filter((service) => response.some((r) => r.id === service.id))
      .map((service) => {
        if (!service.classification_type || !service.classification_id) {
          console.warn(
            "Warning: Service missing classification data:",
            service
          );
          return null;
        }
        const url = `http://localhost:5173/servicios/${service.classification_type.toLowerCase()}/${
          service.classification_id
        }`;
        return {
          ...service,
          url,
        };
      })
      .filter((service) => service !== null);

    res.json({
      greeting: cleanGreeting,
      recommendations: recommendedServices.slice(0, 3),
    });
  } catch (error) {
    console.error("Error:", error);
    const defaultGreeting =
      "¡Bienvenido a nuestro salón! Esperamos que disfrutes de tu experiencia.";
    getPopularServices(res, allServices, defaultGreeting);
  }
};

async function getPopularServices(res, allServices, greeting = "¡Bienvenido!") {
  try {
    const popularServices = allServices
      .slice(0, 3)
      .map((service) => {
        if (!service.classification_type || !service.classification_id) {
          console.warn(
            "Warning: Service missing classification data:",
            service
          );
          return null;
        }

        return {
          ...service,
          url: `http://localhost:5173/servicios/${service.classification_type.toLowerCase()}/${
            service.classification_id
          }`,
        };
      })
      .filter((service) => service !== null);

    res.json({ greeting: greeting, recommendations: popularServices });
  } catch (error) {
    console.error("Error getting popular services:", error);
    res.status(500).json({
      greeting: "¡Bienvenido!",
      recommendations: [],
      message: "Error al obtener recomendaciones.",
    });
  }
}
