import express, { type Express } from "express";
import { initDB } from "./config/db.config";
import { initRedis } from "./config/redis.config";
import apiRouter from "./api/auth/auth.routes";
import cookieParser from "cookie-parser";
import { checkAuthSession } from "./api/auth/password/session.service";

export const app: Express = express();

initDB();
initRedis();

app.use(cookieParser());
app.use(express.json());

app.use("/api", apiRouter);
app.post("/api/test-session", checkAuthSession);

app.use((req, res) => {
  res.status(400).json({ message: "Final mmiddleware error" });
});
