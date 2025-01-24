import {
  getServiceActiveClient,
  ObtainNonActiveCustomerService,
  getServices,
  updateAppointmentStatus,
  getSpecialistAssignedServices,
  createRating,
  checkAppointmentStatus,
  createRatingAndUpdateAppointment,
} from "../models/service.model.js";
import { pool } from "../db.js";

export const getActiveAppointment = async (req, res) => {
  try {
    const { userID } = req.query;
    if (!userID) {
      return res
        .status(400)
        .json({ message: "No se ha enviado el id del usuario" });
    }

    const getAppointment = await getServiceActiveClient(userID);

    if (!getAppointment || getAppointment.length === 0) {
      return res.json({ message: "No hay servicios activos" });
    } else {
      const appointments = getAppointment
        .map((appointment) => {
          const services = JSON.parse(appointment.services);
          const scheduled_date = JSON.parse(appointment.scheduled_date);

          if (
            !appointment.id ||
            !services ||
            !scheduled_date ||
            !appointment.status_order
          ) {
            return null;
          }

          const appointmentData = {
            id: appointment.id,
            services: services,
            status_name: appointment.status_name,
            payment_method_name: appointment.payment_method_name,
            start_appointment: appointment.start_appointment,
            end_appointment: appointment.end_appointment,
            status_order: appointment.status_order,
            paid: appointment.paid,
            address: appointment.address,
            coordenadas: appointment.point,
            amount: appointment.amount,
            scheduled_date: scheduled_date,
            reference_payment: appointment.reference_payment,
            specialists: appointment.specialists,
          };

          return appointmentData;
        })
        .filter(Boolean);

      if (appointments.length === 0) {
        return res.json({ message: "No hay servicios activos" });
      }

      return res.status(200).json(appointments);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error al obtener la cita activa",
      error: error.message,
    });
  }
};

export const getAnonActiveAppointment = async (req, res) => {
  try {
    const { userID } = req.query;
    if (!userID) {
      return res
        .status(400)
        .json({ message: "No se ha enviado el id del usuario" });
    }
    const getNonActiveAppointment = await ObtainNonActiveCustomerService(
      userID
    );
    res.json(getNonActiveAppointment);
    if (!getNonActiveAppointment || getNonActiveAppointment.length === 0) {
      return res.json({ message: "No hay servicios inactivos" });
    } else {
      const appointmentsData = getNonActiveAppointment.map((appointment) => {
        const serviceJSON = JSON.parse(appointment.services);
        const scheduled_dateJSON = JSON.parse(appointment.scheduled_date);
        return {
          id: appointment.id,
          services: serviceJSON,
          status_id: appointment.status_name,
          start_appointment: appointment.start_appointment,
          end_appointment: appointment.end_appointment,
          status_order: appointment.status_order,
          paid: appointment.paid,
          address: appointment.address,
          coordenadas: appointment.point,
          payment_method: appointment.payment_method_name,
          amount: appointment.amount,
          scheduled_date: scheduled_dateJSON,
          reference_payment: appointment.reference_payment,
        };
      });
      res.status(200).json(appointmentsData);
    }
  } catch (error) {
    console.log(error);
  }
};

export const services = async (req, res, next) => {
  try {
    const service = await getServices();
    res.status(200).json(service);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const assignSpecialist = async (req, res, next) => {
  const { appointmentId, specialistId, serviceId, sessions } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const checkQuery = `
      SELECT 
        COALESCE(SUM(sessions_assigned), 0) AS total_assigned,
        COALESCE(COUNT(DISTINCT specialist_id), 0) AS specialists_count
      FROM appointment_specialists
      WHERE appointment_id = $1 AND service_id = $2
    `;
    const {
      rows: [checkResult],
    } = await client.query(checkQuery, [appointmentId, serviceId]);

    const totalAssigned = parseInt(checkResult.total_assigned);
    const specialistsCount = parseInt(checkResult.specialists_count);

    const serviceQuery = `
      SELECT services
      FROM appointment
      WHERE id = $1
    `;
    const {
      rows: [appointmentData],
    } = await client.query(serviceQuery, [appointmentId]);
    const services = JSON.parse(appointmentData.services);
    const service = services.find((s) => s.id === serviceId);

    if (!service) {
      throw new Error("Servicio no encontrado en la cita.");
    }

    const availableSessions = service.quantity - totalAssigned;

    if (sessions > availableSessions) {
      throw new Error(
        `No puedes asignar más de las sesiones disponibles. Restantes: ${availableSessions}`
      );
    }

    // Permitir múltiples especialistas si no se han cubierto todas las sesiones
    const insertQuery = `
      INSERT INTO appointment_specialists 
        (appointment_id, specialist_id, service_id, sessions_assigned)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const { rows: result } = await client.query(insertQuery, [
      appointmentId,
      specialistId,
      serviceId,
      sessions,
    ]);

    // Actualizar el estado solo la primera vez que se asigna un especialista
    if (specialistsCount === 0) {
      const statusQuery = `
        SELECT id FROM classification 
        WHERE classification_type = 'Especialista asignado'
      `;
      const {
        rows: [statusRow],
      } = await client.query(statusQuery);

      if (statusRow) {
        await client.query(
          `
          UPDATE appointment 
          SET status_id = $1 
          WHERE id = $2
        `,
          [statusRow.id, appointmentId]
        );
      }
    }

    await client.query("COMMIT");
    res.status(200).json(result[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al asignar especialista:", error.message);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { appointmentId, status, specialistId } = req.body;

    if (!specialistId) {
      return res.status(400).json({ error: "specialistId es requerido" });
    }

    const updatedStatus = await updateAppointmentStatus(
      appointmentId,
      status,
      specialistId
    );

    res
      .status(200)
      .json({
        status: updatedStatus,
        message: "Estado actualizado correctamente",
      });
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    res.status(500).json({ error: error.message });
  }
};

export const createRatingController = async (req, res) => {
  try {
    const { appointmentId, rating, role, userId } = req.body;

    // Verificaciones
    if (!appointmentId)
      return res.status(400).json({ error: "appointmentId es requerido" });
    if (!rating) return res.status(400).json({ error: "rating es requerido" });
    if (!role) return res.status(400).json({ error: "role es requerido" });
    if (!userId) return res.status(400).json({ erro: "userId es requerido" });
    // Verificar token
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Token no proporcionado o inválido" });
    }

    // Verificar el rol
    let ratedBy;
    if (role === "57") ratedBy = "cliente";
    else if (role === "58") ratedBy = "especialista";
    else return res.status(400).json({ error: "Rol inválido" });

    console.log(`Rol del usuario: ${ratedBy}`);

    // Crear la calificación
    const newRating = await createRating(
      userId,
      appointmentId,
      rating,
      ratedBy
    );

    res.status(201).json({
      message: "Calificación guardada exitosamente",
      rating: newRating,
    });
  } catch (error) {
    console.error("Error en createRatingController:", error);
    res.status(500).json({ error: "Error al guardar calificación" });
  }
};

export const getAssignedServices = async (req, res, next) => {
  try {
    const specialistId = req.params.specialistId;
    const services = await getSpecialistAssignedServices(specialistId);
    res.status(200).json(services);
  } catch (error) {
    console.error("Error al obtener servicios asignados:", error);
    next(error);
  }
};

export const getStatusService = async (req, res) => {
  const { appointmentId, specialistId } = req.params;

  try {
    // Consulta SQL directa
    const query = `
      SELECT status_id
      FROM appointment_specialists
      WHERE appointment_id = $1 AND specialist_id = $2
    `;
    const values = [appointmentId, specialistId];

    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
      res.status(200).json({ status: result.rows[0].status_id });
    } else {
      res.status(404).json({ message: "Estado no encontrado" });
    }
  } catch (error) {
    console.error("Error al obtener estado del especialista:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const getClassification = async (req, res) => {
  const { statusId } = req.params;
  try {
    const result = await pool.query(
      "SELECT classification_type FROM public.classification WHERE id = $1",
      [statusId]
    );
    if (result.rows.length > 0) {
      res.json({ classification_type: result.rows[0].classification_type });
    } else {
      res.json({ classification_type: "No encontrado" });
    }
  } catch (error) {
    console.error("Error fetching classification:", error);
    res.status(500).send("Error al obtener la clasificación");
  }
};

export const createRatingController2 = async (req, res) => {
  try {
    const { appointmentId, rating, role, userId } = req.body;

    // Validate required fields
    if (!appointmentId || !rating || !role || !userId) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    // Verify authorization token
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Token no proporcionado o inválido" });
    }

    // Determine rated by role
    let ratedBy;
    if (role === "57") ratedBy = "cliente";
    else if (role === "58") ratedBy = "especialista";
    else return res.status(400).json({ error: "Rol inválido" });

    // Check appointment status before rating
    const appointmentStatus = await checkAppointmentStatus(appointmentId);
    if (!appointmentStatus) {
      return res
        .status(400)
        .json({ error: "No se puede calificar este servicio" });
    }

    // Create rating and update appointment status
    const result = await createRatingAndUpdateAppointment(
      userId,
      appointmentId,
      rating,
      ratedBy
    );

    res.status(201).json({
      message: "Calificación guardada exitosamente",
      rating: result,
    });
  } catch (error) {
    console.error("Error en createRatingController:", error);
    res.status(500).json({ error: "Error al guardar calificación" });
  }
};
