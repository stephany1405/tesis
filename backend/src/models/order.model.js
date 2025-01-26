import { pool } from "../db.js";
export const InsertCard = async ({
  user_id,
  services,
  scheduled_date,
  status_order,
  paid,
  address,
  amount,
  referencePayment,
  coordenadas,
}) => {
  const client = await pool.connect();
  try {
    const query = {
      text: `
        INSERT INTO public."appointment" (
          user_id, 
          services, 
          status_id, 
          scheduled_date, 
          status_order, 
          paid, 
          address, 
          payment_method, 
          amount,
          reference_payment,
          point
        ) VALUES ($1, $2, 
          (SELECT id FROM public.classification WHERE classification_type = 'Asignando especialista'), 
          $3::json, $4, $5, $6,
          (SELECT id FROM public.classification WHERE classification_type = 'tarjeta'),
          $7, $8, $9)
        RETURNING *;
      `,
      values: [
        user_id,
        services,
        scheduled_date,
        status_order,
        paid,
        address,
        amount,
        referencePayment,
        coordenadas,
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
  services,
  scheduled_date,
  status_order = true,
  paid = false,
  address,
  amount,
  referencePayment,
  coordenadas,
}) => {
  const client = await pool.connect();
  try {
    const query = {
      text: `
        INSERT INTO public."appointment" (
          user_id, 
          services, 
          status_id, 
          scheduled_date,
          status_order, 
          paid, 
          address, 
          payment_method, 
          amount,
          reference_payment,
          point
        ) VALUES (
          $1, $2,
          (SELECT id FROM public.classification WHERE classification_type = 'Asignando especialista'), 
          $3, $4, $5, $6, 
          (SELECT id FROM public.classification WHERE classification_type = 'efectivo'),
          $7, $8, $9
        )
        RETURNING *;
      `,
      values: [
        user_id,
        services,
        scheduled_date,
        status_order,
        paid,
        address,
        amount,
        referencePayment,
        coordenadas,
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
  services,
  scheduled_date,
  status_order = true,
  paid = true,
  address,
  amount,
  referencePayment,
  coordenadas,
}) => {
  const client = await pool.connect();
  try {
    const query = {
      text: `
        INSERT INTO public."appointment" (
          user_id, 
          services, 
          status_id, 
          scheduled_date, 
          status_order, 
          paid, 
          address, 
          payment_method, 
          amount,
          reference_payment,
          point
        ) VALUES (
          $1, $2,
          (SELECT id FROM public.classification WHERE classification_type = 'Asignando especialista'), 
          $3, $4, $5, $6, 
          (SELECT id FROM public.classification WHERE classification_type = 'pago móvil'),
          $7, $8,$9
        )
        RETURNING *;
      `,
      values: [
        user_id,
        services,
        scheduled_date,
        status_order,
        paid,
        address,
        amount,
        referencePayment,
        coordenadas,
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
