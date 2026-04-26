import express, { type Express } from "express";
import { initDB } from "./config/db.config";
import { initRedis } from "./config/redis.config";

export const app: Express = express();

initDB();
initRedis();

app.get("/api", (req, res) => {
  res.send("hello from 3000");
});
