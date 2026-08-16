import { createContext, useContext, useEffect, useState } from "react";
import { io as clientIo } from "socket.io-client";

const socketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const sock = clientIo(`${process.env.NEXT_PUBLIC_BASE_URL}`, {
      autoConnect: true,
      transports: ["websocket", 'polling'],
    });

    setSocket(sock);

    sock.on("connect", () => {
      console.log("web app socket connected!: ", sock.id);
    });

    return () => {
      sock.disconnect();
    };
  }, []);

  return (
    <socketContext.Provider value={socket}>
      {children}
    </socketContext.Provider>
  );
};

export const useSocket = () => useContext(socketContext);
