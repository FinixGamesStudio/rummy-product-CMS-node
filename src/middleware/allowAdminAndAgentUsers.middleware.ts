import { NextFunction, Response, Request } from 'express';
import RequestWithUser from '../interface/requestWithUser.interface';
import { ERROR_MESSAGES, STATUS_CODE, USER_CONSTANT } from '../constant';
import { MongoService } from '../utils';
import AdminUserModel from '../api/adminUser/adminUser.model';

function allowAdminAndAgentUsers() {
    const allowAdminAndAgentUsers = async (
        request: Request,
        response: Response,
        next: NextFunction
    ): Promise<boolean> => {
        try {
            const req = request as RequestWithUser;
            const userRole = req.user.role;

            // get all agent roles
            let agentRoles = await MongoService.find(AdminUserModel, {
                select: 'adminUserRoleName'
            });
            agentRoles = agentRoles.map((agentRoles: any) => agentRoles.adminUserRoleName);

            if (userRole === USER_CONSTANT.ROLES.admin) {
                next();
                return true;
            } else if (agentRoles.includes(userRole)) {
                next();
                return true;
            } else {
                response.statusCode = STATUS_CODE.NON_AUTHORITATIVE_INFORMATION;
                throw new Error(ERROR_MESSAGES.NOT_ACCESS);
            }
        } catch (error) {
            next(error);
            return false;
        }
    };

    return allowAdminAndAgentUsers;
}

export default allowAdminAndAgentUsers;
