// src/hooks/useWebSocket.js
import React, { useEffect, useRef } from "react";
export const useWebSocket = (url, onMessage) => {
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log("WebSocket conectado correctamente");
    };

    ws.current.onmessage = (e) => {
      console.log("Mensaje recibido:", e.data);
      onMessage(JSON.parse(e.data));
    };

    ws.current.onerror = (error) => {
      console.error("Error en WebSocket:", error);
    };
    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log("Mensaje recibido:", data);
      onMessage(data);
    };
    return () => ws.current?.close();
  }, [url, onMessage]);

  return ws;
};
