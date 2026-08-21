import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export const useSocket = (userId, onTaskUpdate) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL);

    socketRef.current.emit("join_user_room", userId);

    socketRef.current.on("task_update", (updatedTask) => {
      onTaskUpdate(updatedTask);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId, onTaskUpdate]);

  // eslint-disable-next-line react-hooks/refs
  return socketRef.current;
};
