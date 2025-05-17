// src/types/express/index.d.ts
import { AuthTokenPayload } from "../../middlewares/auth.middleware";

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export {};
