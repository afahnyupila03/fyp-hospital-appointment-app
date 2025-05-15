"use client";

import { useSocket } from "@/store/socket";
import { useEffect, useRef } from "react";

export const NotificationListener = () => {
  const socket = useSocket();
  const seenRef = useRef(new Set());

  useEffect(() => {
    if (!socket) return;
    console.log("🔌 [Client] Subscribing to new-notification");

    const handler = (notif) => {
      // Ensure you don't double-notify the same ID.
      if (seenRef.current.has(notif._id)) return;
      seenRef.current.add(notif._id);

      console.log("🔔 [Client] Got new-notification:", notif);

      if (Notification.permission === "granted") {
        new Notification("New Notification", {
          body: notif.message,
          tag: notif._id,
          timestamp: Date.parse(notif.createdAt),
        });
      }
    };

    socket.on("new-notification", handler);
    return () => {
      socket.off("new-notification", handler);
    };
  }, [socket]);

  return null; // this component renders nothing.
};
