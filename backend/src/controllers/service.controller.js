import {
  getServiceActiveClient,
  ObtainNonActiveCustomerService,
  getServices,
  updateAppointmentStatus,
  getSpecialistAssignedServices,
  createRating,
  checkAppointmentStatus,
  createRatingAndUpdateAppointment,
  cancelAppointmentForSpecialist,
} from "../models/service.model.js";
import { pool } from "../db.js";
import moment from "moment";
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

export const getInPersonAppointments = async (req, res) => {
  try {
    const query = `
      SELECT
        a.id,
        a.services,
        a.scheduled_date,
        a.status_id,
        status_class.classification_type as status_name,
        payment_class.classification_type as payment_method_name,
        a.status_order,
        a.paid,
        a.address,
        a.point,
        a.amount,
        a.reference_payment,
        client.name as client_name,
        client.lastname as client_lastname,
        COALESCE(
          json_agg(
            json_build_object(
              'id', u.id,
              'name', u.name,
              'lastname', u.lastname,
              'telephone_number', u.telephone_number,
              'picture_profile', u.picture_profile,
              'score', u.score
            )
          ) FILTER (WHERE u.id IS NOT NULL),
          '[]'
        ) as specialists
      FROM public.appointment a
      LEFT JOIN public.classification status_class ON a.status_id = status_class.id
      LEFT JOIN public.classification payment_class ON a.payment_method = payment_class.id
      LEFT JOIN public.appointment_specialists as_link ON a.id = as_link.appointment_id
      LEFT JOIN public."user" u ON as_link.specialist_id = u.id
      LEFT JOIN public."user" client ON a.user_id = client.id
      WHERE a.address = 'Presencial en el Salón de Belleza'
      AND a.status_order = true
      GROUP BY
        a.id,
        a.services,
        a.status_id,
        status_class.classification_type,
        payment_class.classification_type,
        as_link.start_appointment,
        as_link.end_appointment,
        a.status_order,
        a.paid,
        a.address,
        a.point,
        a.amount,
        a.scheduled_date,
        a.reference_payment,
        client.name,
        client.lastname
      ORDER BY a.scheduled_date DESC`;

    const result = await pool.query(query);
    const appointments = result.rows
      .map((appointment) => {
        try {
          const services = JSON.parse(appointment.services);
          const serviceInfo = services;
          const scheduledDate = JSON.parse(appointment.scheduled_date);

          const startRaw = scheduledDate.start;
          const endRaw = scheduledDate.end;

          const [fullDate, startTime] = startRaw.split(", ").slice(1);
          const [day, , month, year] = fullDate.split(" ");
          const cleanDate = `${day} ${month} ${year}`;

          const formattedDate = moment(cleanDate, "DD MMMM YYYY", "es").format(
            "YYYY-MM-DD"
          );
          const start = moment(
            `${formattedDate} ${startTime}`,
            "YYYY-MM-DD h:mm A",
            "es"
          ).toISOString();
          const end = moment(
            `${formattedDate} ${endRaw}`,
            "YYYY-MM-DD h:mm A",
            "es"
          ).toISOString();

          let color;
          if (parseInt(appointment.status_id) === 70) {
            color = "#008000";
          } else if (parseInt(appointment.status_id) === 67) {
            color = "#FF69B4";
          }
          return {
            id: appointment.id,
            title: serviceInfo.title,
            start,
            end,
            client: `${appointment.client_name} ${appointment.client_lastname}`,
            status: appointment.status_name,
            service: serviceInfo.title,
            color: color,
            extendedProps: {
              amount: appointment.amount,
              paid: appointment.paid,
              point: appointment.point,
              serviceInfo: serviceInfo,
              status: appointment.status_name,
              paymentMethod: appointment.payment_method_name,
              client: `${appointment.client_name} ${appointment.client_lastname}`,
              specialist:
                appointment.specialists && appointment.specialists.length > 0
                  ? `${appointment.specialists[0].name} ${appointment.specialists[0].lastname}`
                  : null,
            },
          };
        } catch (error) {
          console.error("Error procesando appointment:", error);
          return null;
        }
      })
      .filter(Boolean);

    res.json(appointments);
  } catch (error) {
    console.error("Error completo:", error);
    res.status(500).json({
      error: "Error al obtener las citas",
      details: error.message,
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

    if (!getNonActiveAppointment || getNonActiveAppointment.length === 0) {
      return res.json({ message: "No hay servicios inactivos" });
    }

    const appointmentsData = getNonActiveAppointment.map((appointment) => {
      return {
        id: appointment.id,
        services: JSON.parse(appointment.services),
        status_id: appointment.status_name,
        start_appointment: appointment.start_appointment,
        end_appointment: appointment.end_appointment,
        status_order: appointment.status_order,
        paid: appointment.paid,
        address: appointment.address,
        coordenadas: appointment.point,
        payment_method: appointment.payment_method_name,
        amount: appointment.amount,
        scheduled_date: JSON.parse(appointment.scheduled_date),
        reference_payment: appointment.reference_payment,
        specialists: appointment.specialists,
      };
    });

    res.status(200).json(appointmentsData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno en el servidor" });
  }
};

export const services = async (req, res, next) => {
  const { specialistID } = req.query;
  try {
    const service = await getServices(specialistID);
    res.status(200).json(service);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const assignSpecialist = async (req, res, next) => {
  const { appointmentId, specialistId, serviceId, sessions } = req.body;
  try {
    await pool.query("BEGIN");

    const checkQuery = `
      SELECT 
        COALESCE(SUM(sessions_assigned), 0) AS total_assigned,
        COALESCE(COUNT(DISTINCT specialist_id), 0) AS specialists_count
      FROM appointment_specialists
      WHERE appointment_id = $1 AND service_id = $2
    `;
    const {
      rows: [checkResult],
    } = await pool.query(checkQuery, [appointmentId, serviceId]);

    const totalAssigned = parseInt(checkResult.total_assigned);
    const specialistsCount = parseInt(checkResult.specialists_count);

    const serviceQuery = `
      SELECT services
      FROM appointment
      WHERE id = $1
    `;
    const {
      rows: [appointmentData],
    } = await pool.query(serviceQuery, [appointmentId]);
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

    const insertQuery = `
      INSERT INTO appointment_specialists 
        (appointment_id, specialist_id, service_id, sessions_assigned)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const { rows: result } = await pool.query(insertQuery, [
      appointmentId,
      specialistId,
      serviceId,
      sessions,
    ]);

    if (specialistsCount === 0) {
      const statusQuery = `
        SELECT id FROM classification 
        WHERE classification_type = 'Especialista asignado'
      `;
      const {
        rows: [statusRow],
      } = await pool.query(statusQuery);

      if (statusRow) {
        await pool.query(
          `
          UPDATE appointment 
          SET status_id = $1 
          WHERE id = $2
        `,
          [statusRow.id, appointmentId]
        );
      }
    }

    await pool.query("COMMIT");
    req.wss.broadcastStatusUpdate(
      appointmentId,
      specialistId,
      "Especialista asignado"
    );

    res.status(200).json(result[0]);
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error al asignar especialista:", error.message);
    res.status(500).json({ error: error.message });
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

    if (req.wss) {
      req.wss.broadcastStatusUpdate(appointmentId, specialistId, status);
    } else {
      console.error("WebSocket server not available on req.wss");
    }

    res.status(200).json({
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

    if (!appointmentId)
      return res.status(400).json({ error: "appointmentId es requerido" });
    if (!rating) return res.status(400).json({ error: "rating es requerido" });
    if (!role) return res.status(400).json({ error: "role es requerido" });
    if (!userId) return res.status(400).json({ erro: "userId es requerido" });
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Token no proporcionado o inválido" });
    }

    let ratedBy;
    if (role === "57") ratedBy = "cliente";
    else if (role === "58") ratedBy = "especialista";
    else return res.status(400).json({ error: "Rol inválido" });

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

    if (!appointmentId || !rating || !role || !userId) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Token no proporcionado o inválido" });
    }

    let ratedBy;
    if (role === "57") ratedBy = "cliente";
    else if (role === "58") ratedBy = "especialista";
    else return res.status(400).json({ error: "Rol inválido" });

    const appointmentStatus = await checkAppointmentStatus(appointmentId);
    if (!appointmentStatus) {
      return res
        .status(400)
        .json({ error: "No se puede calificar este servicio" });
    }

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

export const cancelAppointment = async (req, res) => {
  const { specialistID, appointmentID } = req.body;
  try {
    if (!specialistID || !appointmentID) {
      res.status(400).json({ message: "Falta parámetros requeridos." });
    }
    await cancelAppointmentForSpecialist(specialistID, appointmentID);
    res.status(200).json({ message: "cita cancelada para el especialista." });
  } catch (error) {
    res.status(500).json({
      message: "Error interno en el servidor, controlador CancelAppointment",
      error: error,
    });
  }
};

export const historySpecialist = async (req, res) => {
  try {
    const { roleID, specialistID } = req.query;
    if (!roleID || !specialistID) {
      return res.status(400).json({ message: "Falta parámetros requeridos." });
    }
    const query = {
      text: `WITH EspecialistasServicios AS (
  SELECT
    u.id AS especialista_id,
    u.name || ' ' || u.lastname AS nombre_especialista,
    s.classification_type AS nombre_servicio,
    a.id AS id_appointment,
    a.scheduled_date AS fecha_cita,
    a.address AS direccion,
    a.point AS coordenadas,
    aspe.start_appointment AS inicio_cita,
    aspe.end_appointment AS fin_cita,
    aspe.earnings AS ganancias_servicio,
    r.rating AS calificacion_cliente,
    r2.rating AS calificacion_especialista,
    uc.name || ' ' || uc.lastname AS nombre_cliente,
    pm.classification_type AS metodo_pago,
    as_status.classification_type AS estado_servicio  -- Nuevo: Estado del servicio
  FROM public.user u
  JOIN public.appointment_specialists aspe ON u.id = aspe.specialist_id
  JOIN public.appointment a ON aspe.appointment_id = a.id
  JOIN public.classification s ON aspe.service_id = s.id
  JOIN public.user uc ON a.user_id = uc.id
  LEFT JOIN public.ratings r ON a.id = r.appointment_id AND r.rated_by = 'cliente'
  LEFT JOIN public.ratings r2 ON a.id = r2.appointment_id AND r2.rated_by = 'especialista'
  LEFT JOIN public.classification pm ON a.payment_method = pm.id
  LEFT JOIN public.classification as_status ON aspe.status_id = as_status.id  -- Unimos con classification para el estado del servicio
  WHERE u.role_id = $1
  AND a.status_order = false 
  AND u.id IN ($2)
)
SELECT * FROM EspecialistasServicios ORDER BY nombre_especialista, fecha_cita;`,
      values: [roleID, specialistID],
    };
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error al obtener historial de especialista",
      error: error.message,
    });
  }
};

export const addSpecialistToAppointment = async (req, res) => {
  const { appointmentId } = req.params;
  const { specialistId } = req.body;
  try {
    const appointmentCheck = await pool.query(
      "SELECT * FROM appointment WHERE id = $1 AND address = 'Presencial en el Salón de Belleza'",
      [appointmentId]
    );

    if (appointmentCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Cita no encontrada o no es presencial." });
    }

    const specialistCheck = await pool.query(
      "SELECT * FROM public.user WHERE id = $1 AND role_id = 58",
      [specialistId]
    );

    if (specialistCheck.rows.length === 0) {
      return res.status(404).json({ error: "Especialista no encontrado" });
    }

    const result = await pool.query(
      `INSERT INTO appointment_specialists (appointment_id, specialist_id, service_id, sessions_assigned, created_at, status_id)
       VALUES ($1, $2, 
         (SELECT (services::jsonb -> 0 ->> 'id')::int AS service_id
          FROM APPOINTMENT WHERE ID = $1), 
         1, NOW(), 66)
       RETURNING *`,
      [appointmentId, specialistId]
    );

    await pool.query("UPDATE appointment SET status_id = 70 WHERE id = $1", [
      appointmentId,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al agregar especialista:", error);
    res
      .status(500)
      .json({ error: "Error al agregar especialista", details: error.message });
  }
};

export const updateAppointmentSpecialist = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { newSpecialistId } = req.body;

    await pool.query("BEGIN");

    const updateQuery = `
      UPDATE appointment_specialists 
      SET specialist_id = $1
      WHERE appointment_id = $2
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [
      newSpecialistId,
      appointmentId,
    ]);

    if (result.rows.length === 0) {
      throw new Error("No se encontró la cita especificada");
    }

    await pool.query("COMMIT");

    res.json({
      message: "Especialista actualizado exitosamente",
      data: result.rows[0],
    });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error al actualizar especialista:", error);
    res.status(500).json({
      error: "Error al actualizar el especialista",
      details: error.message,
    });
  }
};

export const getSpecialistAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId, specialistId } = req.params;

    if (!appointmentId || !specialistId) {
      return res
        .status(400)
        .json({ error: "Se requieren appointmentId y specialistId" });
    }

    const query = `
          SELECT status_id
          FROM appointment_specialists
          WHERE appointment_id = $1 AND specialist_id = $2;
      `;
    const result = await pool.query(query, [appointmentId, specialistId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "No se encontró el estado para esta cita y especialista.",
      });
    }

    const statusId = result.rows[0].status_id;
    res.status(200).json({ status: statusId });
  } catch (error) {
    console.error("Error al obtener el estado inicial:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAvailability = async (req, res) => {
  try {
    const { start, duration } = req.query;

    if (!start || !duration) {
      return res.status(400).json({
        error: "Se requieren start (fecha y hora) y duration (en horas).",
      });
    }

    const startDate = new Date(start);
    const durationInHours = parseFloat(duration);

    if (isNaN(durationInHours)) {
      return res
        .status(400)
        .json({ error: "duration debe ser un número válido." });
    }

    const query = `
      WITH parsed_appointments AS (
        SELECT 
          id,
          (scheduled_date->>'start')::timestamp as start_time,
          CASE 
            WHEN scheduled_date->>'duration' LIKE '%hora%' THEN
              (regexp_replace(scheduled_date->>'duration', '[^0-9.]', '', 'g'))::float * interval '1 hour'
            WHEN scheduled_date->>'duration' LIKE '%minuto%' THEN
              (regexp_replace(scheduled_date->>'duration', '[^0-9.]', '', 'g'))::float * interval '1 minute'
          END as duration_interval
        FROM appointment
        WHERE status_id NOT IN (69, 71) -- Excluir citas canceladas o completadas
      )
      SELECT COUNT(DISTINCT id) as count
      FROM parsed_appointments
      WHERE (
        start_time,
        start_time + duration_interval
      ) OVERLAPS (
        $1::timestamp,
        $1::timestamp + ($2 || ' hours')::interval
      );
    `;

    const result = await pool.query(query, [startDate, durationInHours]);
    const overlappingAppointments = parseInt(result.rows[0].count, 10);
    const maxAppointmentsPerHour = 10;
    const availableSlots = Math.max(
      0,
      maxAppointmentsPerHour - overlappingAppointments
    );

    res.status(200).json({
      available: availableSlots,
      overlapping: overlappingAppointments,
    });
  } catch (error) {
    console.error("Error al obtener la disponibilidad:", error);
    let errorMessage = "Error al obtener la disponibilidad";
    if (error.code === "22007") {
      errorMessage += ". Formato de fecha inválido en la base de datos.";
    }
    res.status(500).json({ error: errorMessage, details: error.message });
  }
};

export const cancelInPersonAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    if (!appointmentId) {
      return res
        .status(422)
        .json({ message: "Identificador AppointmentId Requerido." });
    }
    const query = {
      text: `UPDATE PUBLIC.APPOINTMENT SET status_order = false WHERE id = $1`,
      values: [appointmentId],
    };

    await pool.query(query);

    res.status(200).json({ message: "Cancelado Exitosamente." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error interno en el servidor.", error: error });
    console.error(error);
  }
};

export const changeAppointmentDay = async (req, res) => {
  const { id } = req.params;
  const { newStartDate, newEndDate } = req.body;

  try {
    const appointmentCheck = await pool.query(
      "SELECT scheduled_date FROM public.appointment WHERE id = $1",
      [id]
    );

    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }

    const currentAppointment = await pool.query(
      "SELECT scheduled_date FROM public.appointment WHERE id = $1",
      [id]
    );

    const currentScheduledDate = JSON.parse(
      currentAppointment.rows[0].scheduled_date
    );

    const newScheduledDate = {
      start: newStartDate,
      end: newEndDate,
      duration: currentScheduledDate.duration,
    };
    await pool.query(
      "UPDATE public.appointment SET scheduled_date = $1::jsonb WHERE id = $2",
      [JSON.stringify(newScheduledDate), id]
    );

    res.json({
      message: "Fecha de la cita actualizada exitosamente",
      scheduledDate: newScheduledDate,
    });
  } catch (error) {
    console.error("Error al actualizar la fecha de la cita:", error);
    res.status(500).json({
      error: "Error al actualizar la fecha de la cita",
      details: error.message,
    });
  }
};
