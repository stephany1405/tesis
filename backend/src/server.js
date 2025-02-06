import WebSocket, { WebSocketServer } from "ws";

export const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("Nuevo cliente WebSocket conectado");

    ws.on("error", (error) => {
      console.error("Error en la conexión WebSocket:", error);
    });

    ws.on("close", () => {
      console.log("Cliente WebSocket desconectado");
    });
  });

  wss.broadcastStatusUpdate = (appointmentId, specialistId, status) => {
    const numAppointmentId = BigInt(appointmentId).toString();
    const numSpecialistId = BigInt(specialistId).toString();

    console.log("Enviando actualización:", {
      appointmentId: numAppointmentId,
      specialistId: numSpecialistId,
      status,
    });

    wss.clients.forEach((client) => {
      try {
        if (client.readyState === client.OPEN) {
          console.log("Enviando actualización:", {
            appointmentId: numAppointmentId,
            specialistId: numSpecialistId,
            status,
          });
          client.send(
            JSON.stringify({
              type: "STATUS_UPDATE",
              data: {
                appointmentId: numAppointmentId,
                specialistId: numSpecialistId,
                status,
              },
            })
          );
        }
      } catch (error) {
        console.error("Error al enviar mensaje a cliente:", error);
      }
    });
  };

  return wss;
};
