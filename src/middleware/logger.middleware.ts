import { NextFunction, Request } from 'express';
import Logger from '../logger';

const loggerMiddleware = (request: Request, next: NextFunction): void => {
  Logger.warn(`${request.method} ${request.path}`);
  return next();
};

export default loggerMiddleware;
