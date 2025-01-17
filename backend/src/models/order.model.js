import { pool } from "../db.js";
export const InsertCard = async ({
  user_id,
  specialist_id = null,
  services,
  scheduled_date,
  start_appointment = null,
  end_appointment = null,
  status_order = true,
  paid = true,
  address,
  amount,
}) => {
  const client = await pool.connect();
  try {
    const query = {
      text: `
        INSERT INTO public."appointment" (
          user_id, 
          specialist_id, 
          services, 
          status_id, 
          scheduled_date, 
          start_appointment, 
          end_appointment, 
          status_order, 
          paid, 
          address, 
          payment_method, 
          amount
        ) VALUES (
          $1, $2, $3, 
          (SELECT id FROM public.classification WHERE classification_type = 'asignando especialista'), 
          $4, $5, $6, $7, $8, $9, 
          (SELECT id FROM public.classification WHERE classification_type = 'tarjeta'),
          $10
        )
        RETURNING *;
      `,
      values: [
        user_id,
        specialist_id,
        services,
        scheduled_date,
        start_appointment,
        end_appointment,
        status_order,
        paid,
        address,
        amount,
      ],
    };

    const { rows } = await client.query(query);
    return rows[0];
  } catch (error) {
    console.error("Error al crear la cita a domicilio:", error);
    throw error;
  } finally {
    client.release();
  }
};

export const InsertCash = async ({
  user_id,
  specialist_id = null,
  services,
  scheduled_date,
  start_appointment = null,
  end_appointment = null,
  status_order = true,
  paid = false,
  address,
  amount,
}) => {
  const client = await pool.connect();
  try {
    const query = {
      text: `
        INSERT INTO public."appointment" (
          user_id, 
          specialist_id, 
          services, 
          status_id, 
          scheduled_date, 
          start_appointment, 
          end_appointment, 
          status_order, 
          paid, 
          address, 
          payment_method, 
          amount
        ) VALUES (
          $1, $2, $3, 
          (SELECT id FROM public.classification WHERE classification_type = 'asignando especialista'), 
          $4, $5, $6, $7, $8, $9, 
          (SELECT id FROM public.classification WHERE classification_type = 'efectivo'),
          $10
        )
        RETURNING *;
      `,
      values: [
        user_id,
        specialist_id,
        services,
        scheduled_date,
        start_appointment,
        end_appointment,
        status_order,
        paid,
        address,
        amount,
      ],
    };

    const { rows } = await client.query(query);
    return rows[0];
  } catch (error) {
    console.error("Error al crear la cita a domicilio:", error);
    throw error;
  } finally {
    client.release();
  }
};


export const InsertMobilePayment = async ({
  user_id,
  specialist_id = null,
  services,
  scheduled_date,
  start_appointment = null,
  end_appointment = null,
  status_order = true,
  paid = true,
  address,
  amount,
}) => {
  const client = await pool.connect();
  try {
    const query = {
      text: `
        INSERT INTO public."appointment" (
          user_id, 
          specialist_id, 
          services, 
          status_id, 
          scheduled_date, 
          start_appointment, 
          end_appointment, 
          status_order, 
          paid, 
          address, 
          payment_method, 
          amount
        ) VALUES (
          $1, $2, $3, 
          (SELECT id FROM public.classification WHERE classification_type = 'asignando especialista'), 
          $4, $5, $6, $7, $8, $9, 
          (SELECT id FROM public.classification WHERE classification_type = 'pago móvil'),
          $10
        )
        RETURNING *;
      `,
      values: [
        user_id,
        specialist_id,
        services,
        scheduled_date,
        start_appointment,
        end_appointment,
        status_order,
        paid,
        address,
        amount,
      ],
    };

    const { rows } = await client.query(query);
    return rows[0];
  } catch (error) {
    console.error("Error al crear la cita a domicilio:", error);
    throw error;
  } finally {
    client.release();
  }
};