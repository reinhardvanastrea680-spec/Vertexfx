import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "https://vertexfx-backend.onrender.com";
const SocketContext = createContext();

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [prices, setPrices] = useState({});
  const subscriptionsRef = useRef(new Set());

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    // Listen for price ticks on all subscribed symbols
    socket.on("price:tick", (data) => {
      setPrices((prev) => ({
        ...prev,
        [data.symbol]: { bid: parseFloat(data.bid), ask: parseFloat(data.ask), timestamp: data.timestamp },
      }));
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  const subscribe = useCallback((symbol) => {
    if (socketRef.current && !subscriptionsRef.current.has(symbol)) {
      socketRef.current.emit("subscribe:price", { symbol });
      subscriptionsRef.current.add(symbol);
    }
  }, []);

  const unsubscribe = useCallback((symbol) => {
    if (socketRef.current) {
      socketRef.current.emit("unsubscribe:price", { symbol });
      subscriptionsRef.current.delete(symbol);
    }
  }, []);

  const subscribeAll = useCallback((symbols) => {
    symbols.forEach((s) => subscribe(s));
  }, [subscribe]);

  return (
    <SocketContext.Provider value={{ connected, prices, subscribe, unsubscribe, subscribeAll, socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}

