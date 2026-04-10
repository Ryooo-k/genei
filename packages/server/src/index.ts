import "dotenv/config";
import Fastify from "fastify";
import { Server } from "socket.io";
import { registerAuthRoutes } from "./auth/router.js";
import { setupAuthMiddleware } from "./auth/middleware.js";

const fastify = Fastify({ logger: true });
const io = new Server(fastify.server, {
  cors: { origin: "*" },
});

registerAuthRoutes(fastify);
setupAuthMiddleware(io);

io.on("connection", (socket) => {
  const user = (socket.request as { user?: { userId: string } }).user;
  fastify.log.info(`connected: ${socket.id} (userId: ${user?.userId})`);

  socket.on("disconnect", () => {
    fastify.log.info(`disconnected: ${socket.id}`);
  });
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
