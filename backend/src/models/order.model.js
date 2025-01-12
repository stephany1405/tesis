import Stripe from "stripe";



// const orderPayment = async () => {
//   const client = await pool.connect();
//   try {
//   } catch (error) {
//   } finally {
//     client.release();
//   }
// };

const createOrder = async (orderData) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Obtener ID del estado "pendiente por pago"
    const status_Query = {
      text: `SELECT id FROM public.classification WHERE classification_type = 'pendiente por pago'`, // Cambié las comillas dobles por simples
    };
    const status_Result = await client.query(status_Query);
    const status_id = status_Result.rows[0].id;

    // Obtener un especialista aleatorio
    const specialistQuery = {
      text: `SELECT id FROM specialists ORDER BY RANDOM() LIMIT 1;`,
    };
    const specialistResult = await client.query(specialistQuery);
    if (specialistResult.rowCount === 0) {
      throw new Error("No hay especialistas disponibles.");
    }
    const randomSpecialistId = specialistResult.rows[0].id;

    const servicesData = [];
    for (let servicio of orderData.servicios) {
      const serviceQuery = {
        text: `SELECT id FROM public.classification WHERE classification_type = $1 LIMIT 1`,
        values: [servicio.classification_type],
      };
      const serviceResult = await client.query(serviceQuery);
      if (serviceResult.rowCount === 0) {
        throw new Error(
          `No se encontró el servicio para ${servicio.classification_type}`
        );
      }
      const service_id = serviceResult.rows[0].id;
      servicesData.push({
        service_id: service_id,
        note_of_service: servicio.note_of_services,
      });
    }

    // Insertar la cita para cada servicio
    const appointmentPromises = servicesData.map(
      async ({ service_id, note_of_service }) => {
        const query = {
          text: `INSERT INTO appointment (user_id, specialist_id, service_id, status_id, scheduled_date, note, start_appointment, end_appointment, note_of_services)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id;`,
          values: [
            orderData.user_id,
            randomSpecialistId,
            service_id,
            status_id,
            orderData.scheduled_date,
            orderData.note,
            null, // Lógica para start_appointment
            null, // Lógica para end_appointment
            note_of_service, // La nota de cada servicio
          ],
        };
        const appointmentResult = await client.query(query);
        return appointmentResult.rows[0];
      }
    );

    const appointments = await Promise.all(appointmentPromises);

    await client.query("COMMIT");

    return {
      appointments,
      message: "Orden creada exitosamente",
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al crear la orden:", error);
    throw error;
  } finally {
    client.release();
  }
};

export{
    createOrder
}