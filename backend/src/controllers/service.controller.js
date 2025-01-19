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
      const appointment = getAppointment[0];
      const serviceJSON = JSON.parse(appointment.services);
      const scheduled_dateJSON = JSON.parse(appointment.scheduled_date);

      const appointmentData = {
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
        specialist_name: appointment.specialist_name,
        specialist_lastname: appointment.specialist_lastname,
        specialist_photo: appointment.specialist_photo,
        specialist_rating: appointment.specialist_rating,
      };
      res.status(200).json(appointmentData);
    }
  } catch (error) {
    console.log(error);
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
          specialist_name: appointment.specialist_name,
          specialist_lastname: appointment.specialist_lastname,
          specialist_photo: appointment.specialist_photo,
          specialist_rating: appointment.specialist_rating,
        };
      });
      res.status(200).json(appointmentsData);
    }
  } catch (error) {
    console.log(error);
  }
};
