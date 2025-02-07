import { pool } from "../db.js";

export const getServiceActiveClient = async (userID) => {
  const client = await pool.connect();

  try {
    const query = {
      text: `
       SELECT 
    a.id,
    a.services,
    status_class.classification_type as status_name,
    payment_class.classification_type as payment_method_name,
    as_link.start_appointment,
    as_link.end_appointment,
    a.status_order,
    a.paid,
    a.address,
    a.point,
    a.amount,
    a.scheduled_date,
    a.reference_payment,
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
WHERE a.user_id = $1 
AND a.status_order = true 
GROUP BY 
    a.id,
    a.services,
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
    a.reference_payment 
ORDER BY a.scheduled_date DESC
      `,
      values: [parseInt(userID, 10)],
    };

    const { rows } = await client.query(query);
    return rows.length > 0 ? rows : null;
  } catch (error) {
    console.log({ error: error.message });
    throw error;
  } finally {
    client.release();
  }
};

export const ObtainNonActiveCustomerService = async (userID) => {
  const client = await pool.connect();

  try {
    const query = {
      text: `SELECT 
    a.id,
    a.services,
    status_class.classification_type AS status_name,
    payment_class.classification_type AS payment_method_name,
    as_link.start_appointment,
    as_link.end_appointment,
    a.status_order,
    a.paid,
    a.address,
    a.point,
    a.amount,
    a.scheduled_date,
    a.reference_payment,
    COALESCE(
        json_agg(
            json_build_object(
                'id', u.id,
                'name', u.name,
                'lastname', u.lastname,
                'telephone_number', u.telephone_number,
                'picture_profile', u.picture_profile,
                'score', u.score,
                'rating', COALESCE(r.rating, 0)
            )
        ) FILTER (WHERE u.id IS NOT NULL),
        '[]'
    ) AS specialists 
FROM public.appointment a 
LEFT JOIN public.classification status_class 
    ON a.status_id = status_class.id 
LEFT JOIN public.classification payment_class 
    ON a.payment_method = payment_class.id 
LEFT JOIN public.appointment_specialists as_link 
    ON a.id = as_link.appointment_id 
LEFT JOIN public."user" u 
    ON as_link.specialist_id = u.id 
LEFT JOIN public.ratings r 
    ON r.appointment_id = a.id 
    AND r.rated_by = 'cliente' 
    AND r.user_id = a.user_id
    AND as_link.specialist_id = (
        SELECT specialist_id 
        FROM public.appointment_specialists 
        WHERE appointment_id = a.id 
        LIMIT 1
    )
WHERE a.user_id = $1
AND a.status_order = false 
GROUP BY 
    a.id,
    a.services,
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
    a.reference_payment 
ORDER BY a.scheduled_date DESC
LIMIT 10;
`,
      values: [parseInt(userID, 10)],
    };

    const { rows } = await client.query(query);
    return rows.length > 0 ? rows : null;
  } catch (error) {
    console.log({ error: error.message });
    throw error;
  } finally {
    client.release();
  }
};

export const getServices = async (specialistID) => {
  const client = await pool.connect();

  try {
    const query = {
      text: `
       WITH service_details AS (
    SELECT 
        a.id AS appointment_id,
        CAST(service->>'id' AS BIGINT) AS service_id,
        CAST(service->>'quantity' AS INTEGER) AS total_quantity
    FROM public.appointment a,
    jsonb_array_elements(a.services::jsonb) AS service
),
service_assignments AS (
    SELECT 
        appointment_id, 
        service_id, 
        SUM(sessions_assigned) AS total_assigned
    FROM appointment_specialists
    GROUP BY appointment_id, service_id
),
order_status AS (
    SELECT
        sd.appointment_id,
        SUM(sd.total_quantity) AS total_required_sessions,
        COALESCE(SUM(sa.total_assigned), 0) AS total_assigned_sessions
    FROM service_details sd
    LEFT JOIN service_assignments sa
        ON sd.appointment_id = sa.appointment_id
        AND sd.service_id = sa.service_id
    GROUP BY sd.appointment_id
),
specialist_cancellations AS (
    SELECT DISTINCT appointment_id
    FROM specialist_cancelled_appointments
    WHERE specialist_id = $1
)
SELECT 
    a.id,
    a.services,
    a.status_id,
    status_class.classification_type AS status_name,
    payment_class.classification_type AS payment_method_name,
    a.status_order,
    a.paid,
    a.address,
    a.point,
    a.amount,
    a.scheduled_date,
    a.reference_payment,
    aspec.start_appointment,
    aspec.end_appointment,
    u.name AS client_name,
    u.lastname AS client_lastname,
    u.telephone_number AS client_phone
FROM public.appointment a
LEFT JOIN public.classification status_class 
    ON a.status_id = status_class.id
LEFT JOIN public.classification payment_class 
    ON a.payment_method = payment_class.id
LEFT JOIN public.user u
    ON a.user_id = u.id
LEFT JOIN public.appointment_specialists aspec
    ON a.id = aspec.appointment_id
JOIN order_status os
    ON a.id = os.appointment_id
LEFT JOIN specialist_cancellations sc
    ON a.id = sc.appointment_id
WHERE a.status_order = true
    AND a.address != 'Presencial en el Salón de Belleza'
    AND os.total_assigned_sessions < os.total_required_sessions
    AND sc.appointment_id IS NULL
GROUP BY 
    a.id,
    a.services,
    a.status_id,
    status_class.classification_type,
    payment_class.classification_type,
    a.status_order,
    a.paid,
    a.address,
    a.point,
    a.amount,
    a.scheduled_date,
    a.reference_payment,
    aspec.start_appointment,
    aspec.end_appointment,
    u.name,
    u.lastname,
    u.telephone_number
ORDER BY a.scheduled_date DESC;
      `,
      values: [specialistID],
    };
    const { rows } = await client.query(query);
    return rows.length > 0 ? rows : null;
  } catch (error) {
    console.log({ error: error.message });
    throw error;
  } finally {
    client.release();
  }
};

export const getSpecialistAssignedServices = async (specialistId) => {
  const client = await pool.connect();

  try {
    const query = {
      text: `
        SELECT 
    a.id AS appointment_id,
    a.services,
    a.status_id,
    as_spec.start_appointment, -- Desde appointment_specialists
    as_spec.end_appointment,   -- Desde appointment_specialists
    a.address,
    a.point,
    a.scheduled_date,
    status_class.classification_type AS status_name,
    u.name AS client_name,
    u.lastname AS client_lastname,
    u.telephone_number AS client_phone,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'service_id', as_spec.service_id,
            'sessions_assigned', as_spec.sessions_assigned,
            'service_title', (
                SELECT classification_type 
                FROM public.classification 
                WHERE id = as_spec.service_id
            )
        )
    ) AS assigned_services
FROM 
    appointment_specialists as_spec
JOIN 
    appointment a ON a.id = as_spec.appointment_id
JOIN 
    "user" u ON u.id = a.user_id
JOIN 
    classification status_class ON status_class.id = a.status_id
WHERE 
    as_spec.specialist_id = $1
    AND a.status_order = true
    AND a.status_id NOT IN (
        SELECT id 
        FROM classification 
        WHERE classification_type = 'Final del servicio'
    )
GROUP BY 
    a.id,
    a.services,
    a.status_id,
    status_class.classification_type,
    u.name,
    u.lastname,
    u.telephone_number,
    as_spec.start_appointment, -- Incluir en el GROUP BY
    as_spec.end_appointment    -- Incluir en el GROUP BY
ORDER BY 
    CAST(
        JSON_BUILD_OBJECT('start', SPLIT_PART(a.scheduled_date::json->>'start', ',', 1)) AS json
    )->>'start' DESC;
      `,
      values: [specialistId],
    };

    const { rows } = await client.query(query);

    const processedRows = rows.map((row) => {
      const services = JSON.parse(row.services);
      const assignedServices = row.assigned_services.map((as) => {
        const serviceDetails = services.find((s) => s.id === as.service_id);
        return {
          ...serviceDetails,
          sessions_assigned: as.sessions_assigned,
          service_title: as.service_title,
        };
      });

      return {
        ...row,
        services: assignedServices,
      };
    });

    return processedRows;
  } catch (error) {
    console.log("Error en getSpecialistAssignedServices:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const updateAppointmentStatus = async (
  appointmentId,
  status,
  specialistId
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const appointmentQuery = `
      SELECT amount, services
      FROM appointment
      WHERE id = $1
    `;
    const {
      rows: [appointmentDetails],
    } = await client.query(appointmentQuery, [appointmentId]);

    const totalAmount = parseFloat(
      appointmentDetails.amount.replace("$", "").trim()
    );

    const systemShare = totalAmount * 0.2;
    const specialistShare = totalAmount * 0.8;

    const specialistsQuery = `
      SELECT DISTINCT specialist_id
      FROM appointment_specialists
      WHERE appointment_id = $1
    `;
    const { rows: specialistsRows } = await client.query(specialistsQuery, [
      appointmentId,
    ]);
    const totalSpecialists = specialistsRows.length;

    const individualSpecialistEarnings =
      totalSpecialists > 0
        ? (specialistShare / totalSpecialists).toFixed(2)
        : 0;

    const statusQuery = `
      SELECT id
      FROM classification
      WHERE classification_type = $1
    `;
    const {
      rows: [statusRow],
    } = await client.query(statusQuery, [status]);

    if (!statusRow) {
      throw new Error("Estado no válido");
    }

    if (status === "Inicio del servicio") {
      await client.query(
        `UPDATE appointment_specialists
         SET start_appointment = CURRENT_TIMESTAMP
         WHERE appointment_id = $1 AND specialist_id = $2`,
        [appointmentId, specialistId]
      );
    }

    const updateQuery = `
      UPDATE appointment_specialists
      SET 
        status_id = $1,
        earnings = $2
      WHERE appointment_id = $3 AND specialist_id = $4
      RETURNING *
    `;
    const {
      rows: [updatedRow],
    } = await client.query(updateQuery, [
      statusRow.id,
      individualSpecialistEarnings,
      appointmentId,
      specialistId,
    ]);

    if (!updatedRow) {
      throw new Error(
        "No se pudo actualizar el estado en appointment_specialists"
      );
    }

    if (status === "Final del servicio") {
      await client.query(
        `
          UPDATE appointment_specialists
          SET 
            end_appointment = CURRENT_TIMESTAMP,
            earnings = $1
          WHERE appointment_id = $2
        `,
        [individualSpecialistEarnings, appointmentId]
      );
    }

    await client.query("COMMIT");
    return updatedRow;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const createRating = async (userId, appointmentId, rating, ratedBy) => {
  const client = await pool.connect();

  try {
    const query = `
      INSERT INTO ratings (
        user_id, 
        appointment_id, 
        rating, 
        rated_by
      ) VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const { rows } = await client.query(query, [
      userId,
      appointmentId,
      rating,
      ratedBy,
    ]);

    await updateUserScore(userId);

    return rows[0];
  } catch (error) {
    console.error("Error creating rating:", error);
    throw error;
  } finally {
    client.release();
  }
};

const updateUserScore = async (userId) => {
  const client = await pool.connect();

  try {
    const query = `
      UPDATE "user" u
      SET score = (
        SELECT AVG(rating) 
        FROM ratings 
        WHERE user_id = $1
      )
      WHERE id = $1
    `;

    await client.query(query, [userId]);
  } catch (error) {
    console.error("Error updating user score:", error);
  } finally {
    client.release();
  }
};

export const checkAppointmentStatus = async (appointmentId) => {
  const client = await pool.connect();

  try {
    const query = `
      SELECT 1 
      FROM appointment_specialists 
      WHERE appointment_id = $1 AND status_id = 73
    `;

    const { rows } = await client.query(query, [appointmentId]);
    return rows.length > 0;
  } catch (error) {
    console.error("Error checking appointment status:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const createRatingAndUpdateAppointment = async (
  userId,
  appointmentId,
  rating,
  ratedBy
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const ratingQuery = `
      INSERT INTO ratings (
        user_id, 
        appointment_id, 
        rating, 
        rated_by
      ) VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const { rows: ratingRows } = await client.query(ratingQuery, [
      userId,
      appointmentId,
      rating,
      ratedBy,
    ]);

    const updateAppointmentQuery = `
      UPDATE appointment 
      SET status_order = false 
      WHERE id = $1
    `;

    await client.query(updateAppointmentQuery, [appointmentId]);

    await updateUserScore(userId);

    await client.query("COMMIT");

    return ratingRows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creando la evaluación.:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const cancelAppointmentForSpecialist = async (
  specialistID,
  appointmentID
) => {
  try {
    const query = {
      text: `INSERT INTO public.specialist_cancelled_appointments (specialist_id, appointment_id) VALUES ($1, $2)`,
      values: [specialistID, appointmentID],
    };
    await pool.query(query);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
