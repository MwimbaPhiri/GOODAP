import { Server, Socket } from "socket.io";

/**
 * Realtime layer for MediaPulse AI.
 *
 * Clients join a room per organization so the monitoring engine can push live
 * alerts and new-coverage events. (When deployed to a serverless platform like
 * Vercel the custom server is not used and the UI falls back to polling.)
 */
export const setupSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    socket.on("org:join", (organizationId: string) => {
      if (typeof organizationId === "string" && organizationId) {
        socket.join(`org:${organizationId}`);
      }
    });

    socket.on("org:leave", (organizationId: string) => {
      socket.leave(`org:${organizationId}`);
    });
  });
};

/** Broadcast a realtime event to everyone in an organization. */
export function emitToOrg(io: Server, organizationId: string, event: string, payload: unknown) {
  io.to(`org:${organizationId}`).emit(event, payload);
}
