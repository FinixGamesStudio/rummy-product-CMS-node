import { NextFunction, Response, Request } from 'express';
import RequestWithUser from '../interface/requestWithUser.interface';
import {
  ERROR_MESSAGES,
  STATUS_CODE,
  USER_CONSTANT
} from '../constant';


function hasRole(allowedRoles: string[], allowedPermission?: string) {
  const roleMiddleware = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<boolean> => {
    try {
      const req = request as RequestWithUser;
      const user = req.user;
      const adminUserRole = USER_CONSTANT.ROLES.adminUser;
      const agentRoles = USER_CONSTANT.AGENT_ROLES_ARRAY;

      // get all agent roles
      // let agentRoles = await MongoService.find(AdminUserModel, {
      //   select: 'adminUserRoleName'
      // });
      // agentRoles = agentRoles.map((agentRoles: any) => agentRoles.adminUserRoleName);

      if (allowedRoles.includes(user.role)) {
        next();
        return true;
      } else if (agentRoles.includes(user.role) && allowedPermission) {
        const permissionArray = allowedPermission.split('.');
        const module = permissionArray[0];
        const property = permissionArray[1];

        if (
          user &&
          user.adminUserPermission &&
          user.adminUserPermission[module] &&
          user.adminUserPermission[module][property]
        ) {
          next();
          return true;
        } else {
          response.statusCode = STATUS_CODE.NON_AUTHORITATIVE_INFORMATION;
          throw new Error(ERROR_MESSAGES.NOT_ACCESS);
        }
      } else {
        response.statusCode = STATUS_CODE.NON_AUTHORITATIVE_INFORMATION;
        throw new Error(ERROR_MESSAGES.NOT_ACCESS);
      }
    } catch (error) {
      next(error);
      return false;
    }
  };

  return roleMiddleware;
}

export default hasRole;
