import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useContext,
} from "react";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messageQueue = useRef([]);
  const reconnectionTimeout = useRef(null);
  const reconnectionDelay = useRef(5000);
  const connect = () => {
    const socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => {
      console.log("WebSocket conectado correctamente");
      setIsConnected(true);
      reconnectionDelay.current = 5000;

      messageQueue.current.forEach((message) => socket.send(message));
      messageQueue.current = [];
    };

    socket.onmessage = (e) => {
      console.log("Mensaje recibido del WebSocket:", e.data);
      try {
        const parsedData = JSON.parse(e.data);
        console.log("mensaje analizado:", parsedData);
      } catch (error) {
        console.error("Error al analizar el mensaje de WebSocket:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("Error en WebSocket:", error);
      setIsConnected(false);
    };

    socket.onclose = (event) => {
      console.log("WebSocket cerrado:", event.code, event.reason);
      setIsConnected(false);
      setWs(null);

      clearTimeout(reconnectionTimeout.current);
      reconnectionTimeout.current = setTimeout(() => {
        console.log(
          `Intentando reconectar (delay: ${reconnectionDelay.current}ms)...`
        );
        connect();
        reconnectionDelay.current = Math.min(
          reconnectionDelay.current * 2,
          60000
        );
      }, reconnectionDelay.current);
    };

    setWs(socket);
  };

  useEffect(() => {
    connect();

    return () => {
      clearTimeout(reconnectionTimeout.current);
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const sendMessage = (message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      messageQueue.current.push(JSON.stringify(message));
      console.warn("WebSocket no conectado. Mensaje en cola.");
    }
  };

  return (
    <WebSocketContext.Provider value={{ ws, isConnected, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => useContext(WebSocketContext);
