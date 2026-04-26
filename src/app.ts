import express, { type Express } from "express";
import { initDB } from "./config/db.config";

export const app: Express = express();

initDB();

app.get("/api", (req, res) => {
  res.send("hello from 3000");
});
