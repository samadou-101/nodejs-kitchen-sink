import type { AuthContext } from "@/modules/ecom/auth/rbac/rbac.types";

namespace NodeJS {
  interface ProcessEnv {
    DB_URL_NEON: string;
    REDIS_URL: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}
