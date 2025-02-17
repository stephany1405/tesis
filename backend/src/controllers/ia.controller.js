import { pool } from "../db.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
export const getServicesData = async () => {
  try {
    const categoriesQuery = `
        SELECT id, classification_type AS name
        FROM public.classification
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
FROM public.classification s
JOIN public.classification c ON s.parent_classification_id = c.id
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
    const genAI = new GoogleGenerativeAI(
      "AIzaSyA54ISLfYno0VU577oHe6d1zAQBowctdks" 
    );
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let greetingPrompt;

    if (userServices.length === 0) {
      greetingPrompt = `Eres un asistente amigable de un salón de belleza...`;
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

      greetingPrompt = `Eres un asistente amigable de un salón de belleza...`; 
    }

    const greetingResult = await model.generateContent(greetingPrompt);
    const greetingText = (await greetingResult.response).text();
    const cleanGreeting = greetingText.replace(/```/g, "").trim();

    if (userServices.length === 0) {
      return getPopularServices(res, allServices, cleanGreeting);
    }

    const recommendationPrompt = `
      Eres un recomendador de servicios de belleza.  Tu tarea es la siguiente:
      
      1.  **Si el usuario tiene historial:** Recomienda 3 servicios del catálogo, considerando las siguientes prioridades, EN ORDEN:
          *   Servicios *relacionados* con los que el usuario ya ha usado.
          *   Servicios *complementarios* a los que ha usado.
          *   Si no hay suficientes servicios relacionados o complementarios, completa las 3 recomendaciones con servicios *populares*.
      
      2.  **Si el usuario NO tiene historial:** Recomienda los 3 servicios *más populares* del catálogo.
      
      3. **SIEMPRE, para cada servicio recomendado, genera su URL de categoría correspondiente y necesitaré que seas muy muy muy preciso con los nombres de las categorias ( category_name) y sus id (category_id).**
      
      **Datos de entrada:**
      
      *   Historial del usuario (array de IDs de servicios): ${JSON.stringify(
        userServices
      )}
      *   Catálogo completo (con nombres de servicios, categorías, classification_type y classification_id): ${JSON.stringify(
        allServices
      )}
      
      **Formato de salida (JSON ESTRICTO):**
      
      \`\`\`json
      [
        {
          "id": ID_DEL_SERVICIO,
          "url": "http://localhost:5173/servicios/category_name/category_id"
        }
      ]
      \`\`\`
      
      **Reglas OBLIGATORIAS:**
      
      *   Devuelve **EXACTAMENTE 3** servicios en formato JSON.  Respeta *estrictamente* el formato de salida.
      *   La "url" debe construirse *exactamente* como se muestra en el ejemplo, usando el "classification_type" y "classification_id" del servicio recomendado. Reemplaza "ID_DEL_SERVICIO", "classification_type_del_servicio" y "classification_id_del_servicio" con los valores correctos.
      *   NO incluyas NINGÚN texto adicional, comentarios, explicaciones, ni siquiera el saludo.  SOLO el JSON.
      * Si el historial de usuario esta vacio, recomienda los 3 servicios mas populares.
      `;

    const result = await model.generateContent(recommendationPrompt);
    const responseText = (await result.response).text();

    const cleanResponse = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      const response = JSON.parse(cleanResponse);

      if (!Array.isArray(response)) {
        throw new Error("Formato de respuesta inválido");
      }

      const recommendedServices = response
        .map((item) => {
          const service = allServices.find((s) => s.id === String(item.id));
          if (!service) {
            console.warn("Servicio no encontrado:", item.id);
            return null;
          }

          return {
            ...service,
            url: item.url,
          };
        })
        .filter((service) => service !== null);

      res.json({
        greeting: cleanGreeting,
        recommendations: recommendedServices,
      });
    } catch (parseError) {
      console.error("Error al parsear la respuesta JSON:", parseError);
      console.error("Respuesta cruda de la IA:", responseText);
      throw new Error(
        "Respuesta de IA no es un JSON válido: " + parseError.message
      );
    }
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
