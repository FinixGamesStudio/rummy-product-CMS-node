import { Router, Request, Response, NextFunction } from 'express';
import Controller from '../../interface/controller.interface';
import authMiddleware from '../../middleware/auth.middleware';
import Logger from '../../logger/index';
import { successMiddleware } from '../../middleware/responseAPI.middleware';
import { MongoService, Pagination } from '../../utils';
import roleMiddleware from '../../middleware/role.middleware';
import SubAdminUserValidator from './subAdminUser.validation';
import AuthenticationService from '../authentication/authentication.service';
import UserModel from '../user/user.model';
import ForgotPasswordModel from '../authentication/forgotPassword.model';

import {
  ROUTES,
  SUCCESS_MESSAGES,
  USER_CONSTANT,
  ERROR_MESSAGES,
  STATUS_CODE,
  PERMISSION,
  COMMON_CONSTANT,
  MAIL_CONFIG
} from '../../constant';
import RequestWithUser from '../../interface/requestWithUser.interface';
import _ from 'lodash';
import { sendEmail } from '../../utils/sesSendMail';

class SubAdminUserController implements Controller {
  public path = `/${ROUTES.SUB_ADMIN_USER}`;
  public router = Router();
  private validation = new SubAdminUserValidator();
  public authenticationService = new AuthenticationService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      authMiddleware,
      roleMiddleware([], PERMISSION.SUB_ADMIN_USER_EDITOR),
      this.validation.createAdminUserValidate(),
      this.createAdminUser
    );

    this.router.post(
      `${this.path}/getSubAdminUser`,
      authMiddleware,
      roleMiddleware([], PERMISSION.SUB_ADMIN_USER_VIEWER),
      this.validation.getSubAdminUserRolesValidate(),
      this.getSubAdminUser
    );

    this.router.put(
      `${this.path}`,
      authMiddleware,
      roleMiddleware([], PERMISSION.SUB_ADMIN_USER_EDITOR),
      this.validation.updateAdminUserValidate(),
      this.updateSubAdminuser
    );

    this.router.delete(
      `${this.path}`,
      authMiddleware,
      roleMiddleware([], PERMISSION.SUB_ADMIN_USER_EDITOR),
      this.validation.deleteSubAdminUserValidate(),
      this.deleteSubAdminUserRole
    );

    this.router.post(
      `${this.path}/activeDeactive`,
      authMiddleware,
      roleMiddleware([], PERMISSION.SUB_ADMIN_USER_EDITOR),
      this.validation.activeDeactiveRoleCategoryValidate(),
      this.activeDeactiveSubAdminuser
    );
  }

  private createAdminUser = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const req = request as RequestWithUser;
      const userId = req.user._id;
      const { permission, email, fullName, phoneNumber } = request.body;
      const password = await this.authenticationService
        .generateRandomPassword(13)
        .toString();
      const subAdminUserRole = USER_CONSTANT.ROLES.subAdminUser;

      const adminUser = await MongoService.findOne(UserModel, {
        query: { _id: userId }
      });

      const permissionKey = Object.keys(permission);

      const responseData = [];
      let isValidSunUserPermission = true;
      const agentPermission = adminUser.adminUserPermission;
      for (let i = 0; i < permissionKey.length; i++) {
        const key = permissionKey[i];
        const element = agentPermission[key];
        responseData.push(element);

        if (element) {
          const reqPermissionElement = permission[key];

          if (reqPermissionElement.viewer == true && element.viewer == false) {
            isValidSunUserPermission = false;
          }

          if (reqPermissionElement.editor == true && element.editor == false) {
            isValidSunUserPermission = false;
          } else if (
            reqPermissionElement.editor == true &&
            reqPermissionElement.viewer == false
          ) {
            isValidSunUserPermission = false;
          }

          if (key == 'helpAndSupportGame') {
            const gameIds = reqPermissionElement.allowedGames;

            for (let j = 0; j < gameIds.length; j++) {
              const gameId = gameIds[j];
              if (!element.allowedGames.includes(gameId)) {
                isValidSunUserPermission = false;
                break;
              }
            }
          }

          if (isValidSunUserPermission == false) {
            break;
          }
        } else {
          isValidSunUserPermission = false;
        }
      }

      if (!isValidSunUserPermission) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'permission')
        );
      }

      let registerData = {
        email: email,
        role: subAdminUserRole,
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

      // To do send email to agent for reset password.
      const tokenData = this.authenticationService.createToken(userData);
      const link = `${process.env.FRONTEND_HOST_URL}${COMMON_CONSTANT.FRONTEND_RESET_PASSWORD_ROUTE}`;
      const resetLink = `${link}/${email}/${tokenData.token}`;
      console.log('resetLink', resetLink);

      const subject = MAIL_CONFIG.SUBJECT.CHANGE_PASSWORD;

      const body = `<h3>You are added as sub admin user into Rummy Standalone<br/> Your password : ${password} <br/> <br/> </h3> Your reset password link will expire in 1 hr.</h3> <br/>Using below link you can change your password.</h3> <br/>  Using below link you can change your password.</h3><br/> Reset Password Link : <a href=${resetLink}>${resetLink}</a>`;

      const mailInfo = await sendEmail(email, subject, body);

      // const mailInfo = await transporter.sendMail({
      //   from: MAIL_CONFIG.FROM,
      //   to: email,
      //   subject: "Change your password",
      //   html: "<h3>You are added as admin user into Rummy Standalone<br/> Your password : " + password + "<br/>Using below link you can change your password.</h3><br/> Reset Password Link : " + resetLink
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
            'Sub Admin'
          ),
          data: { userData }
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(
        `There was an issue into creating an sub Admin user.: ${error}`
      );
      return next(error);
    }
  };

  private getSubAdminUser = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      let { start, limit } = request.body;

      let agentRoles = await Pagination(UserModel, {
        query: {
          role: USER_CONSTANT.ROLES.subAdminUser
        },
        offset: start,
        limit: limit
      });

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(
            ':attribute',
            'Sub Admin'
          ),
          data: agentRoles
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(
        `There was an issue into fetching an sub Admin user roles.: ${error}`
      );
      return next(error);
    }
  };

  private updateSubAdminuser = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const req = request as RequestWithUser;
      const userId = req.user._id;
      const { adminUserId, permission, fullName, phoneNumber } = request.body;

      const adminUser = await MongoService.findOne(UserModel, {
        query: { _id: userId }
      });

      // check agent role exists or not
      let adminUserRole = await MongoService.findOne(UserModel, {
        query: { _id: adminUserId },
        select: '_id'
      });

      if (!adminUserRole) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(
            ':attribute',
            'sub admin user role'
          )
        );
      }

      const permissionKey = Object.keys(permission);

      const responseData = [];
      let isValidSunUserPermission = true;
      const agentPermission = adminUser.adminUserPermission;

      for (let i = 0; i < permissionKey.length; i++) {
        const key = permissionKey[i];
        const element = agentPermission[key];
        responseData.push(element);

        if (element) {
          const reqPermissionElement = permission[key];

          if (reqPermissionElement.viewer == true && element.viewer == false) {
            isValidSunUserPermission = false;
          }

          if (reqPermissionElement.editor == true && element.editor == false) {
            isValidSunUserPermission = false;
          } else if (
            reqPermissionElement.editor == true &&
            reqPermissionElement.viewer == false
          ) {
            isValidSunUserPermission = false;
          }

          if (key == 'helpAndSupportGame') {
            const gameIds = reqPermissionElement.allowedGames;

            for (let j = 0; j < gameIds.length; j++) {
              const gameId = gameIds[j];
              if (!element.allowedGames.includes(gameId)) {
                isValidSunUserPermission = false;
                break;
              }
            }
          }

          if (isValidSunUserPermission == false) {
            break;
          }
        } else {
          isValidSunUserPermission = false;
        }
      }

      if (!isValidSunUserPermission) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'permission')
        );
      }

      let updateData = {
        userName: fullName,
        phoneNumber: phoneNumber,
        adminUserPermission: permission
      };

      const updatedAdminUser = await MongoService.findOneAndUpdate(UserModel, {
        query: { _id: adminUserId },
        updateData: {
          $set: updateData
        }
      });

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.UPDATE_SUCCESS.replace(
            ':attribute',
            'Sub admin user role'
          ),
          data: updatedAdminUser
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(
        `There was an issue into updating a sub admin user role.: ${error}`
      );
      return next(error);
    }
  };

  private deleteSubAdminUserRole = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { subAdminUserRoleId } = request.body;

      // check agent role already exists or not
      const adminUserRole = await MongoService.findOne(UserModel, {
        query: { _id: subAdminUserRoleId }
      });

      if (!adminUserRole) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(
            ':attribute',
            'sub admin user role'
          )
        );
      } else {
        const deleteResult = await MongoService.deleteOne(UserModel, {
          query: { _id: subAdminUserRoleId }
        });

        return successMiddleware(
          {
            message: SUCCESS_MESSAGES.COMMON.DELETE_SUCCESS.replace(
              ':attribute',
              'Sub admin user role'
            ),
            data: adminUserRole
          },
          request,
          response,
          next
        );
      }
    } catch (error) {
      Logger.error(
        `There was an issue into deleting an sub admin user role.: ${error}`
      );
      return next(error);
    }
  };

  private activeDeactiveSubAdminuser = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { subAdminUserRoleId, isActive } = request.body;
      const isActiveBoolean = Boolean(JSON.parse(isActive));
      // check agent role exists or not
      let adminUserRole = await MongoService.findOne(UserModel, {
        query: { _id: subAdminUserRoleId },
        select: '_id'
      });

      if (!adminUserRole) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(
            ':attribute',
            'sub admin user role'
          )
        );
      }

      // update active deactive status
      const updatedAdminUser = await MongoService.findOneAndUpdate(UserModel, {
        query: { _id: subAdminUserRoleId },
        updateData: {
          $set: {
            isBlock: isActiveBoolean
          }
        }
      });

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.UPDATE_SUCCESS.replace(
            ':attribute',
            'Sub admin user'
          ),
          data: updatedAdminUser
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(
        `There was an issue into upadating active/deActive of sub admin user role.: ${error}`
      );
      return next(error);
    }
  };
}

export default SubAdminUserController;
