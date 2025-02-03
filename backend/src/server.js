import { WebSocketServer } from "ws";

export const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("Nuevo cliente WebSocket conectado");

    ws.on("close", () => {
      console.log("Cliente WebSocket desconectado");
    });
  });

  wss.broadcastStatusUpdate = (appointmentId, specialistId, status) => {
    console.log("Enviando actualización:", {
      appointmentId,
      specialistId,
      status,
    });

    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(
          JSON.stringify({
            type: "STATUS_UPDATE",
            data: { appointmentId, specialistId, status },
          })
        );
      }
    });
  };

  return wss;
};
