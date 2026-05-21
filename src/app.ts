import express, { type Express } from "express";
import cors from "cors";
import { initDB } from "./config/db.config";
import { initRedis } from "./config/redis.config";
import apiRouter from "./api/auth/auth.routes";
import cookieParser from "cookie-parser";
import { checkAuthSession } from "./api/auth/password/session.service";
import ecomRouter from "./api/ecom/ecom.route";
import { errorMiddleware } from "./modules/ecom/shared/error.middleware";
import { requestContext } from "./modules/ecom/shared/request-context.middleware";
import pinoHttp from "pino-http";
import { logger } from "./modules/ecom/shared/logger";

export const app: Express = express();

initDB();
initRedis();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.use(requestContext);
app.use(
  pinoHttp({
    logger,
    customProps: (req) => ({ reqId: (req as any).id }),
    autoLogging: {
      ignore: (req) => req.url === "/api/health",
    },
  }),
);

app.use("/api", apiRouter);
app.use("/api/ecom", ecomRouter);
app.post("/api/test-session", checkAuthSession, (req, res) => {
  res.status(200).send("welcome");
});

app.use((req, res) => {
  res.status(400).json({ message: "Final mmiddleware error" });
});

app.use(errorMiddleware);
