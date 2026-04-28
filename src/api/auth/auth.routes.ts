import express, { Router } from "express";
import { passwordAuthHandler } from "./password/password.controller";

const apiRouter: Router = express.Router();

apiRouter.post("/auth/password/register", passwordAuthHandler);
apiRouter.post("/auth/password/login", passwordAuthHandler);
apiRouter.post("/auth/password/refresh", passwordAuthHandler);
apiRouter.post("/auth/password/reset", passwordAuthHandler);

export default apiRouter;
