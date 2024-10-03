import { NextFunction, Response, Request } from 'express';
import * as jwt from 'jsonwebtoken';
import UserModel from '../api/user/user.model';
import DataStoredInToken from '../interface/dataStoredInToken';
import RequestWithUser from '../interface/requestWithUser.interface';
import { ERROR_MESSAGES, STATUS_CODE, USER_CONSTANT } from '../constant';
import getconfig from '../config';
import { MongoService } from '../utils';
const { JWT_SECRET } = getconfig();
import moment from 'moment';

async function authWithoutMiantanenceMiddleware(
    request: Request,
    response: Response,
    next: NextFunction
): Promise<boolean> {
    try {
        const User = UserModel;
        const req = request as RequestWithUser;
        const secret = JWT_SECRET;
        const authHeader = req.headers.authorization as string;
        const verificationResponse = jwt.verify(
            authHeader,
            secret
        ) as DataStoredInToken;
        const _id = verificationResponse._id;
        const user = await MongoService.findOne(User, {
            query: { _id }
        });

        if (!user) {
            response.statusCode = STATUS_CODE.FORBIDDEN;
            throw new Error(ERROR_MESSAGES.TOKEN_EXPIRED);
        }

        if (user.isBlock) {
            response.statusCode = STATUS_CODE.UNAUTHORIZED;
            throw new Error(ERROR_MESSAGES.BLOCKED_USER);
        }

        if (user.isUserDeleteAcount) {
            const defaultHours = USER_CONSTANT.USER_DELETE_ACCOUNT_DAYS * 24
            const now = moment();
            const userDeleteAccountDate = moment(user.userDeleteAccountAt);
            let daysDiffUserDeleteAccount = now.diff(userDeleteAccountDate, 'hours');

            if (daysDiffUserDeleteAccount > defaultHours) {
                response.statusCode = STATUS_CODE.FORBIDDEN;
                throw new Error(ERROR_MESSAGES.USER_ACC_DELETED);
            }
        }

        if (user.role == USER_CONSTANT.ROLES.user) {
            if (authHeader != user.token) {
                response.statusCode = STATUS_CODE.FORBIDDEN;
                throw new Error(ERROR_MESSAGES.ALREADY_LOGIN);
            }

            const secretKey = request.headers['x-mgpapp-key'];
            const secretData = request.headers['x-mgpapp-data'];

            const API_SECRET_KEY = process.env.API_SECRET_KEY;
            const API_SECRET_DATA = process.env.API_SECRET_DATA;

            if (API_SECRET_KEY && API_SECRET_DATA) {
                if (API_SECRET_KEY != secretKey || API_SECRET_DATA != secretData) {
                    response.statusCode = STATUS_CODE.UNAUTHORIZED;
                    throw new Error(ERROR_MESSAGES.NOT_ACCESS);
                }
            }
        }

        req.user = user;
        next();
        return true;
    } catch (error) {
        next(error);
        return false;
    }
}

export default authWithoutMiantanenceMiddleware;
