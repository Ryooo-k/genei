import Fastify from "fastify";
import { Server } from "socket.io";

const fastify = Fastify({ logger: true });
const io = new Server(fastify.server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  fastify.log.info(`connected: ${socket.id}`);

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
