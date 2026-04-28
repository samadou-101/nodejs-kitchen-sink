import express, { type Express } from "express";
import { initDB } from "./config/db.config";
import { initRedis } from "./config/redis.config";
import apiRouter from "./api/auth/auth.routes";
import cookieParser from "cookie-parser";
import { checkAuth } from "./api/auth/password/password.controller";

export const app: Express = express();

initDB();
initRedis();

app.use(cookieParser());
app.use(express.json());
// app.get("/api/hello", checkAuth, (req, res) => {
//   res.send("hello from 3000");
// });

app.use("/api", apiRouter);

app.use((req, res) => {
  res.status(400).json({ message: "Final mmiddleware error" });
});
