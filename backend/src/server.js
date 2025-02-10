import { WebSocketServer } from "ws";

export const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ noServer: true }); // Use noServer: true
  const clients = new Map(); // Store client connections with IDs

  server.on("upgrade", (request, socket, head) => {
    // You *could* do authentication here, e.g., from cookies or headers
    // const token = getAuthTokenFromRequest(request);
    // if (!isValidToken(token)) {
    //   socket.destroy();
    //   return;
    // }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  wss.on("connection", (ws, request) => {
    const clientId = generateUniqueId(); // Implement this!  UUIDs are good.
    clients.set(clientId, ws);
    console.log(`Nuevo cliente WebSocket conectado (${clientId})`);

    ws.on("message", (message) => {
      console.log(`Mensaje recibido del cliente (${clientId}): ${message}`);
      try {
        const parsedMessage = JSON.parse(message);
        // Process the message (e.g., save to database, forward to other clients)
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

    // Send initial data if needed
    ws.send(
      JSON.stringify({
        type: "WELCOME",
        message: "Bienvenido al servidor WebSocket",
      })
    );
  });

  // Helper function to broadcast messages *to specific clients*
  wss.broadcastStatusUpdate = (appointmentId, specialistId, status) => {
    const message = JSON.stringify({
      type: "STATUS_UPDATE",
      data: { appointmentId, specialistId, status },
    });

    // Iterate through connected clients and send only to relevant ones
    for (const [clientId, client] of clients) {
      // IMPORTANT:  You need a way to associate clients with appointments.
      // This is just a placeholder.  You'll need to store this
      // information when the client connects, or when they subscribe
      // to updates for a specific appointment.  Perhaps in a database,
      // or in a Map keyed by appointmentId.
      if (client.readyState === 1) {
        // Check for OPEN state
        client.send(message);
      }
    }
  };
  function generateUniqueId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  return wss;
};
