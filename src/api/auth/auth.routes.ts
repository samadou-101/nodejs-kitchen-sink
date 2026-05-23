import express, { Router } from "express";
import { passwordAuthHandler } from "./password/password.controller";
import { oauthHandler } from "./oauth/custom/oauth.controller";

const apiRouter: Router = express.Router();

apiRouter.post("/auth/password/register", passwordAuthHandler);
apiRouter.post("/auth/password/login", passwordAuthHandler);
apiRouter.post("/auth/password/refresh", passwordAuthHandler);
apiRouter.post("/auth/password/reset", passwordAuthHandler);
apiRouter.post("/auth/password/new", passwordAuthHandler);

apiRouter.get("/auth/oauth/google/url", oauthHandler);
apiRouter.get("/auth/oauth/google/callback", oauthHandler);

export default apiRouter;
