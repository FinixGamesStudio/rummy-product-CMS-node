import { NextFunction, Response, Request } from 'express';
import RequestWithUser from '../interface/requestWithUser.interface';
import { ERROR_MESSAGES, STATUS_CODE } from '../constant';

async function checkApiKeyMiddleware(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<boolean> {
  try {
    const req = request as RequestWithUser;
    const API_SECRET_KEY = process.env.API_SECRET_KEY;
    const API_SECRET_DATA = process.env.API_SECRET_DATA;

    const secretKey = req.headers['x-mgpapp-key'];
    const secretData = req.headers['x-mgpapp-data'];

    if(API_SECRET_KEY && API_SECRET_DATA) {
      if (API_SECRET_KEY != secretKey || API_SECRET_DATA != secretData) {
        response.statusCode = STATUS_CODE.UNAUTHORIZED;
        throw new Error(ERROR_MESSAGES.NOT_ACCESS);
      }
    }

    next();
    return true;
  } catch (error) {
    next(error);
    return false;
  }
}

export default checkApiKeyMiddleware;
