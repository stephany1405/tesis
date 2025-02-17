import { WebSocketServer } from "ws";

export const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ noServer: true });
  const clients = new Map();

  server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  wss.on("connection", (ws, request) => {
    const clientId = generateUniqueId();
    clients.set(clientId, ws);
    console.log(`Nuevo cliente WebSocket conectado (${clientId})`);

    ws.on("message", (message) => {
      console.log(`Mensaje recibido del cliente (${clientId}): ${message}`);
      try {
        const parsedMessage = JSON.parse(message);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });

    ws.on("close", () => {
      clients.delete(clientId);
      console.log(`Cliente WebSocket desconectado (${clientId})`);
    });

    ws.on("error", (error) => {
      console.error(`WebSocket error from client (${clientId}):`, error);
    });

    ws.send(
      JSON.stringify({
        type: "WELCOME",
        message: "Bienvenido al servidor WebSocket",
      })
    );
  });

  wss.broadcastStatusUpdate = (appointmentId, specialistId, status) => {
    const message = JSON.stringify({
      type: "STATUS_UPDATE",
      data: { appointmentId, specialistId, status },
    });

    for (const [clientId, client] of clients) {
      if (client.readyState === 1) {
        client.send(message);
      }
    }
  };
  function generateUniqueId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  return wss;
};
