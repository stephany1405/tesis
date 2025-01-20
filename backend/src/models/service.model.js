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
    a.start_appointment,
    a.end_appointment,
    a.status_order,
    a.paid,
    a.address,
    a.amount,
    a.scheduled_date,
    a.reference_payment,
    COALESCE(
        json_agg(
            json_build_object(
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
    a.start_appointment,
    a.end_appointment,
    a.status_order,
    a.paid,
    a.address,
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
    status_class.classification_type as status_name,
    payment_class.classification_type as payment_method_name,
    a.start_appointment,
    a.end_appointment,
    a.status_order,
    a.paid,
    a.address,
    a.amount,
    a.scheduled_date,
    a.reference_payment,
    COALESCE(
        json_agg(
            json_build_object(
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
AND a.status_order = false
GROUP BY 
    a.id,
    a.services,
    status_class.classification_type,
    payment_class.classification_type,
    a.start_appointment,
    a.end_appointment,
    a.status_order,
    a.paid,
    a.address,
    a.amount,
    a.scheduled_date,
    a.reference_payment
ORDER BY a.scheduled_date DESC
LIMIT 10`,
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
