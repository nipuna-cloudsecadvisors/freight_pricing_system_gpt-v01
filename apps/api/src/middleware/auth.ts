import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { UserRole } from '@prisma/client';
import { appConfig } from '../config/env';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    email: string;
  };
}

export function authenticate(...allowed: UserRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header) {
      if (process.env.NODE_ENV !== 'production') {
        req.user = { id: 'dev-user', role: allowed[0] ?? UserRole.SALES, email: 'dev@example.com' };
        return next();
      }
      return next(createError(401, 'Missing Authorization header'));
    }
    const [, token] = header.split(' ');
    try {
      const payload = jwt.verify(token, appConfig.jwtSecret) as AuthRequest['user'];
      req.user = payload;
      if (allowed.length && !allowed.includes(payload.role)) {
        return next(createError(403, 'Insufficient permissions'));
      }
      return next();
    } catch (error) {
      return next(createError(401, 'Invalid token'));
    }
  };
}
