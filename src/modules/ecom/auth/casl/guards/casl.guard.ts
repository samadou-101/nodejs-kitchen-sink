import type { Request, Response, NextFunction } from 'express';
import type { AppAction, AppSubjects } from '../types';
import { buildAbility } from '../ability.factory';

declare global {
  namespace Express {
    interface Request {
      ability?: ReturnType<typeof buildAbility>;
    }
  }
}

export function attachAbility(req: Request, _res: Response, next: NextFunction): void {
  if (req.auth) {
    req.ability = buildAbility(req.auth);
  }
  next();
}

export function requireAbility(action: AppAction, resource: AppSubjects) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const ability = req.ability ?? buildAbility(req.auth);
    if (!ability.can(action, resource)) {
      res.status(403).json({
        error: 'Forbidden',
        required: { action, subject: resource },
      });
      return;
    }

    next();
  };
}

export function requireInstanceAbility<T extends Record<string, unknown>>(
  action: AppAction,
  resourceType: AppSubjects,
  getSubject: (req: Request) => T,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const ability = req.ability ?? buildAbility(req.auth);
    const data = getSubject(req);
    const target = { ...data, __caslSubjectType__: resourceType };

    if (!ability.can(action, target)) {
      res.status(403).json({
        error: 'Forbidden',
        required: { action, subject: resourceType },
      });
      return;
    }

    next();
  };
}
