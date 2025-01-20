import {
  getServiceActiveClient,
  ObtainNonActiveCustomerService,
} from "../models/service.model.js";

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
      const appointments = getAppointment.map((appointment) => {
        const services = JSON.parse(appointment.services);
        const scheduled_date = JSON.parse(appointment.scheduled_date);
      
        if (!appointment.id || !services || !scheduled_date || !appointment.status_order) {
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
          amount: appointment.amount,
          scheduled_date: scheduled_date,
          reference_payment: appointment.reference_payment,
          specialists: appointment.specialists,
        };

        return appointmentData;
      }).filter(Boolean);

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
    // const { userID } = req.query;
    const userID = 7;
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