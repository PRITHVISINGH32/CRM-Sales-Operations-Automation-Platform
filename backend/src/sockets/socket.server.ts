import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { config } from "../config";

let io: Server | null = null;

export const initSocketServer = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          origin === config.frontendUrl ||
          origin.includes("vercel.app") ||
          origin.includes("localhost") ||
          origin.includes("127.0.0.1")
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join show room for real-time seat status updates
    socket.on("join:show", (showId: string) => {
      const roomName = `show:${showId}`;
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room ${roomName}`);
    });

    socket.on("leave:show", (showId: string) => {
      const roomName = `show:${showId}`;
      socket.leave(roomName);
      console.log(`Socket ${socket.id} left room ${roomName}`);
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io server has not been initialized");
  }
  return io;
};

export interface SeatUpdatePayload {
  showId: string;
  seatId: string;
  status: "AVAILABLE" | "HELD" | "BOOKED" | "OFFERED";
}

export const broadcastSeatUpdate = (
  showId: string,
  seatId: string,
  status: "AVAILABLE" | "HELD" | "BOOKED" | "OFFERED",
) => {
  if (!io) return;
  const roomName = `show:${showId}`;
  const payload: SeatUpdatePayload = {
    showId,
    seatId,
    status,
  };

  // Broadcast to room
  let eventName = "seat:updated";
  if (status === "HELD") eventName = "seat:held";
  else if (status === "AVAILABLE") eventName = "seat:released";
  else if (status === "BOOKED") eventName = "seat:booked";
  else if (status === "OFFERED") eventName = "seat:offered";

  io.to(roomName).emit(eventName, payload);
  io.to(roomName).emit("seat:updated", payload);
};

export const broadcastMultipleSeatUpdates = (
  showId: string,
  updates: Array<{
    seatId: string;
    status: "AVAILABLE" | "HELD" | "BOOKED" | "OFFERED";
  }>,
) => {
  if (!io) return;
  const roomName = `show:${showId}`;
  for (const update of updates) {
    broadcastSeatUpdate(showId, update.seatId, update.status);
  }
};