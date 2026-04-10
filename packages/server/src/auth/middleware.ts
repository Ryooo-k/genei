import jwt from "jsonwebtoken";
import type { Server } from "socket.io";
import { JWT_SECRET } from "../lib/config.js";

export const setupAuthMiddleware = (io: Server) => {
  io.engine.use((req: any, _res: any, next: any) => {
    const isHandshake = req._query.sid === undefined;
    if (!isHandshake) return next();

    const header = req.headers["authorization"];
    if (!header) return next(new Error("no token"));
    if (!header.startsWith("bearer ")) return next(new Error("invalid token"));

    const token = header.substring(7);

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) return next(new Error("invalid token"));
      req.user = decoded;
      next();
    });
  });
};
