import { Router, Request, Response, NextFunction } from 'express';
import Controller from '../../interface/controller.interface';
import AdminUserRoleModel from './adminUser.model';
import authMiddleware from '../../middleware/auth.middleware';
import Logger from '../../logger/index';
import { successMiddleware } from '../../middleware/responseAPI.middleware';
import { MongoService, Pagination } from '../../utils';
import roleMiddleware from '../../middleware/role.middleware';
import AdminUserValidator from './adminUser.validation';
import AuthenticationService from '../authentication/authentication.service';
import UserModel from '../user/user.model';
import ForgotPasswordModel from '../authentication/forgotPassword.model';
import RequestWithUser from '../../interface/requestWithUser.interface';

import {
  ROUTES,
  SUCCESS_MESSAGES,
  USER_CONSTANT,
  ERROR_MESSAGES,
  STATUS_CODE,
  COMMON_CONSTANT,
} from '../../constant';
import { sendEmail } from '../../utils/sesSendMail';

class AdminUserController implements Controller {
  public path = `/${ROUTES.ADMIN_USERS}`;
  public router = Router();
  private AdminUserRoleModel = AdminUserRoleModel;
  private validation = new AdminUserValidator();
  public authenticationService = new AuthenticationService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin]),
      this.validation.createAdminUserValidate(),
      this.createAdminUser
    );

    this.router.put(
      `${this.path}`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin]),
      this.validation.updateAdminUserValidate(),
      this.updateAdminUser
    );

    this.router.post(
      `${this.path}/getAdminUsers`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin]),
      this.validation.getAdminUsersValidate(),
      this.getAdminUsers
    );

    this.router.post(
      `${this.path}/blockUnblock`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin]),
      this.validation.blockUnblockAdminUserValidate(),
      this.blockUnblockAdminUser
    );

    this.router.post(
      `${this.path}/delete`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin]),
      this.validation.deleteAdminUserValidate(),
      this.deleteAdminUser
    );

    this.router.post(
      `${this.path}/getPermissions`,
      authMiddleware,
      roleMiddleware([
        USER_CONSTANT.ROLES.admin,
        USER_CONSTANT.ROLES.subAdminUser,
        USER_CONSTANT.ROLES.adminUser
      ]),
      this.getPermissions
    );
  }

  private createAdminUser = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { permission, email, fullName, phoneNumber } = request.body;
      // const password = await this.authenticationService
      //   .generateRandomPassword(13)
      //   .toString();
      const password = "1234"
      const adminUserRole = USER_CONSTANT.ROLES.adminUser;

      let registerData = {
        email: email,
        role: adminUserRole,
        password: password,
        isBlock: false,
        userName: fullName,
        phoneNumber: phoneNumber,
        adminUserPermission: permission
      };

      // let isAdminUserRoleExists = await MongoService.findOne(this.AdminUserRoleModel, {
      //   query: { adminUserRoleName: adminUserRole, isActive: true },
      //   select: 'adminUserRoleName'
      // });

      // if (!isAdminUserRoleExists) {
      //   response.statusCode = STATUS_CODE.FORBIDDEN;
      //   throw new Error(
      //     ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'admin user role')
      //   );
      // }

      const { already } = await this.authenticationService.register(
        registerData
      );
      if (already) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_TAKEN);
      }

      const userData = await MongoService.findOne(UserModel, {
        query: { email, role: { $ne: USER_CONSTANT.ROLES.admin } }
      });
      Logger.info("============>> userData <<==========="+userData);

      // To do send email to agent for reset password.
      const tokenData = this.authenticationService.createToken(userData);
      // const link = `${process.env.FRONTEND_HOST_URL}${COMMON_CONSTANT.FRONTEND_RESET_PASSWORD_ROUTE}`;
      // const resetLink = `${link}/${email}/${tokenData.token}`;
      // console.log('resetLink  ==>> ', resetLink);

      // const subject = MAIL_CONFIG.SUBJECT.CHANGE_PASSWORD;

      // const body = `<h3>You are added as admin user into Ludo Standalone<br/> Your password : ${password} <br/> </h3> Your reset password link will expire in 1 hr.</h3> <br/>Using below link you can change your password.</h3><br/> Reset Password Link : <a href=${resetLink}>${resetLink}</a>`;

      // const mailInfo = await sendEmail(email, subject, body);

      // const mailInfo = await transporter.sendMail({
      //   from: MAIL_CONFIG.FROM,
      //   to: email,
      //   subject: "Change your password",
      //   html: "<h3>You are added as admin user into POKER Standalone<br/> Your password : " + password + "<br/>Using below link you can change your password.</h3><br/> Reset Password Link : " + resetLink
      // });

      // if (!mailInfo.messageId) {
      //   response.statusCode = STATUS_CODE.NOT_FOUND;
      //   throw new Error(ERROR_MESSAGES.SOMETHING_WENT_WRONG);
      // }

      // delete old tokens
      await MongoService.deleteMany(ForgotPasswordModel, {
        query: { userId: userData._id }
      });

      // create new token
      const forgotPassword = await MongoService.create(ForgotPasswordModel, {
        insert: {
          userId: userData._id,
          email: email,
          resetToken: tokenData.token
        }
      });

      // update token into user table
      const updatedUser = await MongoService.findOneAndUpdate(UserModel, {
        query: { userId: userData._id },
        updateData: { token: tokenData.token }
      });

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.CREATE_SUCCESS.replace(
            ':attribute',
            'Admin user'
          ),
          data: { userData }
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(`There was an issue into creating an admin user.: ${error}`);
      return next(error);
    }
  };

  private updateAdminUser = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { adminUserId, phoneNumber, fullName, permission } = request.body;

      // check agent exists or not
      let isAdminUserExists = await MongoService.findOne(UserModel, {
        query: { _id: adminUserId },
        select: '_id'
      });

      if (!isAdminUserExists) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'admin user')
        );
      }

      // check role exists or not
      // const isRoleExists = await MongoService.findOne(this.AdminUserRoleModel, {
      //   query: { adminUserRoleName: adminUserRole, isActive: true },
      //   select: 'adminUserRoleName'
      // });

      // if (!isRoleExists) {
      //   response.statusCode = STATUS_CODE.BAD_REQUEST;
      //   throw new Error(
      //     ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'admin user role')
      //   );
      // }

      // update agent role into user details
      const updatedUser = await MongoService.findOneAndUpdate(UserModel, {
        query: { _id: adminUserId },
        updateData: {
          $set: { phoneNumber, userName:fullName, adminUserPermission: permission }
        }
      });

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.UPDATE_SUCCESS.replace(
            ':attribute',
            'Admin user'
          ),
          data: updatedUser
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(`There was an issue into updating an admin user.: ${error}`);
      return next(error);
    }
  };

  private getAdminUsers = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      let { start, limit } = request.body;

      const adminUsers = await Pagination(UserModel, {
        query: { role: USER_CONSTANT.ROLES.adminUser },
        offset: start,
        limit
      });

      Logger.info("============>> adminUsers <<===========",adminUsers);
      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(
            ':attribute',
            'Admin users'
          ),
          data: adminUsers
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(
        `There was an issue into fetching an admin users list.: ${error}`
      );
      return next(error);
    }
  };

  private blockUnblockAdminUser = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { adminUserId, isBlock } = request.body;
      const isBlockBoolean = Boolean(JSON.parse(isBlock));

      // check user exists or not
      const user = await MongoService.findOne(UserModel, {
        query: { _id: adminUserId, role: USER_CONSTANT.ROLES.adminUser },
        select: '_id'
      });

      if (!user) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'admin user')
        );
      }

      // update block unblock state
      const updatedUser = await MongoService.findOneAndUpdate(UserModel, {
        query: { _id: adminUserId },
        updateData: { $set: { isBlock: isBlockBoolean } }
      });

      let successMessage = SUCCESS_MESSAGES.COMMON.DEACTIVE_SUCCESS.replace(
        ':attribute',
        'Admin user'
      );
      if (!isBlockBoolean) {
        successMessage = SUCCESS_MESSAGES.COMMON.ACTIVE_SUCCESS.replace(
          ':attribute',
          'Admin user'
        );
      }

      return successMiddleware(
        {
          message: successMessage,
          data: updatedUser
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(
        `There was an issue into block/unblock admin user.: ${error}`
      );
      return next(error);
    }
  };

  private deleteAdminUser = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { adminUserId } = request.body;

      // check user exists or not
      const user = await MongoService.findOne(UserModel, {
        query: { _id: adminUserId, role: USER_CONSTANT.ROLES.adminUser }
      });

      if (!user) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'admin user')
        );
      }

      // delete user
      await MongoService.deleteOne(UserModel, {
        query: { _id: adminUserId, role: USER_CONSTANT.ROLES.adminUser }
      });

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.DELETE_SUCCESS.replace(
            ':attribute',
            'Admin user'
          ),
          data: user
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(`There was an issue into deleting an admin user.: ${error}`);
      return next(error);
    }
  };

  private getPermissions = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const req = request as RequestWithUser;
      const user = req.user;

      let permission = {};

      if (user) {
        permission = user.adminUserPermission;
      }

      const agentData = {
        permission: permission
      };

      const responseData = {
        agentData: agentData
      };

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(
            ':attribute',
            'Permission'
          ),
          data: responseData
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(
        `There was an issue into fetching user permission.: ${error}`
      );
      return next(error);
    }
  };
}

export default AdminUserController;
