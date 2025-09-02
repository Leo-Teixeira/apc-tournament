"use client";
import { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";

type Notification = {
  id: number;
  type: "success" | "error" | "info";
  message: string;
};

type NotificationContextType = {
  notify: (type: Notification["type"], message: string) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timers = useRef<Map<number, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    if (notifications.length > 0) {
      const audio = new Audio("/sounds/notif.mp3");
      audio.play().catch((err) => {
        console.warn("Audio notification failed to play:", err);
      });
    }
  }, [notifications]);

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    // Nettoie aussi le timer associé
    const timeout = timers.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timers.current.delete(id);
    }
  };

  const notify = (type: Notification["type"], message: string) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, message }]);

    // Durée plus longue (ex: 8s)
    const timeout = setTimeout(() => {
      removeNotification(id);
    }, 15000);

    timers.current.set(id, timeout);
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 items-end">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`min-w-[280px] max-w-[400px] px-6 py-4 rounded-xl shadow-lg text-white text-lg font-medium flex justify-between items-center
              ${n.type === "success" ? "bg-green-600" : ""}
              ${n.type === "error" ? "bg-red-600" : ""}
              ${n.type === "info" ? "bg-blue-600" : ""}
            `}
          >
            <span>{n.message}</span>
            <button
              onClick={() => removeNotification(n.id)}
              aria-label="Fermer la notification"
              className="ml-4 text-white hover:text-gray-300 focus:outline-none"
              style={{ fontWeight: 'bold', fontSize: '1.2rem', lineHeight: 1 }}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used inside NotificationProvider");
  return ctx;
};
