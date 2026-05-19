import { randomUUID } from "node:crypto"
import type { Request, Response, NextFunction } from "express"
import { logger } from "./logger"

export function requestContext(req: Request, _res: Response, next: NextFunction) {
  req.id = (req.headers["x-request-id"] as string) ?? randomUUID()
  req.log = logger.child({ reqId: req.id })
  next()
}
