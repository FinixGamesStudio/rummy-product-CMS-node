import * as bcrypt from 'bcrypt';
import { Request, Response, NextFunction, Router } from 'express';
import * as jwt from 'jsonwebtoken';
import Controller from '../../interface/controller.interface';
import DataStoredInToken from '../../interface/dataStoredInToken';
import TokenData from '../../interface/tokenData.interface';
import { User } from '../user/user.interface';
import AuthenticationService from './authentication.service';
import UserModel from '../user/user.model';
import { RegisterUser } from './authentication.interface';
import Logger from '../../logger/index';
import { successMiddleware } from '../../middleware/responseAPI.middleware';
import {
  ROUTES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  STATUS_CODE,
  USER_CONSTANT,
  COMMON_CONSTANT
} from '../../constant';
import { MongoService } from '../../utils';
import getconfig from '../../config';
import AuthenticationValidation from './authentication.validation';
import ForgotPasswordModel from './forgotPassword.model';
import RequestWithUser from '../../interface/requestWithUser.interface';
import authMiddleware from '../../middleware/auth.middleware';
import roleMiddleware from '../../middleware/role.middleware';
import { sendEmail } from '../../utils/sesSendMail';

const { JWT_SECRET } = getconfig();
class AuthenticationController implements Controller {
  public path = `/${ROUTES.AUTH}`;
  public router = Router();
  public authenticationService = new AuthenticationService();
  private User = UserModel;
  private validation = new AuthenticationValidation();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/register`,
      this.validation.registrationValidation(),
      this.registration
    );
    this.router.post(
      `${this.path}/login`,
      this.validation.loginValidation(),
      this.loggingIn
    );
    this.router.post(
      `${this.path}/forgotPassword`,
      this.validation.forgotPasswordValidation(),
      this.forgotPassword
    );
    this.router.post(
      `${this.path}/resetPassword`,
      this.validation.resetPasswordValidation(),
      this.resetPassword
    );

    this.router.post(
      `${this.path}/changePassword`,
      authMiddleware,
      roleMiddleware([
        USER_CONSTANT.ROLES.admin,
        USER_CONSTANT.ROLES.adminUser,
        USER_CONSTANT.ROLES.subAdminUser
      ]),
      this.validation.changePasswordValidation(),
      this.changePassword
    );

    this.router.post(
      `${this.path}/registerPublisher`,
      this.validation.registerPublisherValidation(),
      this.registerPublisher
    );

    this.router.get(`/test`, this.health);
  }

  private registration = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const userData = request.body as RegisterUser;
    try {
      const { user, already, tokenData } =
        await this.authenticationService.register(userData);
      if (already) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_TAKEN);
      }
      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.SUCCESSFULLY_REGISTER,
          data: { user, tokenData }
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error('registration', error);
      return next(error);
    }
  };

  private loggingIn = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { email, password } = request.body;
      const user = await MongoService.findOne(this.User, {
        query: { email },
        select:
          'email role password publisherStatus isBlock lastActivateAt commission phoneNumber country bonus address studioName title'
      });

      if (!user) {
        response.statusCode = STATUS_CODE.NOT_FOUND;
        throw new Error(ERROR_MESSAGES.EMAIL_NOT_FOUND);
      }
      const isPasswordMatching = await bcrypt.compare(password, user.password);
      if (!isPasswordMatching) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(ERROR_MESSAGES.PASSWORD_NOT_MATCH);
      }

      if (user.isBlock) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(ERROR_MESSAGES.BLOCKED_USER);
      }

      const tokenData = this.createToken(user);
      const token = tokenData.token;

      // update users last activate time for get report daily active user
      const updateUser = await MongoService.findOneAndUpdate(this.User, {
        query: { _id: user._id },
        updateData: { $set: { lastActivateAt: new Date(), token } }
      });

      delete user.password;

      // agent permissions
      const agentData = {
        permission: updateUser.adminUserPermission
      };

      const responseData = {
        tokenData: tokenData,
        userData: user,
        agentData: agentData
      };
      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.LOGIN_SUCCESSFULLY,
          data: responseData
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(`Error in login API ${error}`);
      return next(error);
    }
  };

  private forgotPassword = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { email } = request.body;
      const user = await MongoService.findOne(this.User, {
        query: {
          email,
          role: {
            $in: [
              USER_CONSTANT.ROLES.admin,
              USER_CONSTANT.ROLES.subAdminUser,
              USER_CONSTANT.ROLES.adminUser
            ]
          }
        }
      });

      if (!user) {
        response.statusCode = STATUS_CODE.NOT_FOUND;
        throw new Error(
          ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'email')
        );
      }

      const tokenData = this.createToken(user);
      // const link = `${process.env.FRONTEND_HOST_URL}${COMMON_CONSTANT.FRONTEND_RESET_PASSWORD_ROUTE}`;
      // const resetLink = `${link}/${email}/${tokenData.token}`;
      // console.log('resetLink', resetLink);

      // const subject = MAIL_CONFIG.SUBJECT.RESET_PASSWORD;

      // const body = `<h3>Using below link you can change your password.</h3><br/> Reset Password Link : <a href=${resetLink}>${resetLink}</a>`;

      // const mailInfo = await sendEmail(email, subject, body);

      // const mailInfo = await transporter.sendMail({
      //   from: MAIL_CONFIG.FROM,
      //   to: email,
      //   subject: 'Reset Password',
      //   html:
      //     '<h3>Using below link you can change your password.</h3><br/> Reset Password Link : ' +
      //     resetLink
      // });

      // if (!mailInfo) {
      //   response.statusCode = STATUS_CODE.NOT_FOUND;
      //   throw new Error(ERROR_MESSAGES.SOMETHING_WENT_WRONG);
      // }

      // if (!mailInfo.messageId) {
      //   response.statusCode = STATUS_CODE.NOT_FOUND;
      //   throw new Error(ERROR_MESSAGES.SOMETHING_WENT_WRONG);
      // }

      // delete old tokens
      await MongoService.deleteMany(ForgotPasswordModel, {
        query: { userId: user._id }
      });

      // create new token
      const forgotPassword = await MongoService.create(ForgotPasswordModel, {
        insert: { userId: user._id, email: email, resetToken: tokenData.token }
      });

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.MAIL_SENT_SUCCESS,
          data: email
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(`There was an issue into forgot password.:  ${error}`);
      return next(error);
    }
  };

  private resetPassword = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { email, resetToken, password } = request.body;
      const forgotPasswordRecord = await MongoService.findOne(
        ForgotPasswordModel,
        {
          query: { email: email, resetToken: resetToken }
        }
      );

      if (!forgotPasswordRecord) {
        response.statusCode = STATUS_CODE.NOT_FOUND;
        throw new Error(
          ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'user')
        );
      }

      // verify token
      const verificationResponse = jwt.verify(
        resetToken,
        JWT_SECRET
      ) as DataStoredInToken;

      console.log(
        '=========verificationResponse========',
        verificationResponse
      );
      const tokenUserId = verificationResponse._id;

      if (tokenUserId !== forgotPasswordRecord.userId.toString()) {
        response.statusCode = STATUS_CODE.NON_AUTHORITATIVE_INFORMATION;
        throw new Error(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'token')
        );
      }

      // hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // update password
      const updatedUser = await MongoService.findOneAndUpdate(this.User, {
        query: { _id: tokenUserId },
        updateData: { password: hashedPassword }
      });

      // delete old tokens
      await MongoService.deleteMany(ForgotPasswordModel, {
        query: { userId: tokenUserId }
      });

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.USER_PASSWORD_CHANGE_SUCCESS,
          data: updatedUser
        },
        request,
        response,
        next
      );
    } catch (error: any) {
      console.log('error.message', error.message);
      error.message =
        error.message === 'jwt expired'
          ? ERROR_MESSAGES.TOKEN_LINK_EXPIRED
          : error.message;

      Logger.error(`There was an issue into reset password.:  ${error}`);
      return next(error);
    }
  };

  private changePassword = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const req = request as RequestWithUser;
      const userId = req.user._id;
      const userRole = req.user.role;
      const { oldPassword, password } = request.body;
      const user = await MongoService.findOne(this.User, {
        query: { _id: userId },
        select: 'password',
        lean: false
      });

      if (user) {
        const isPasswordMatching = await bcrypt.compare(
          oldPassword,
          user.password
        );
        if (!isPasswordMatching) {
          response.statusCode = STATUS_CODE.BAD_REQUEST;
          throw new Error(ERROR_MESSAGES.CURRENT_PASSWORD_NOT_MATCH);
        } else {
          const hashedPassword = await bcrypt.hash(password, 10);

          const updatePassword = await MongoService.findOneAndUpdate(
            this.User,
            {
              query: { _id: userId },
              updateData: {
                $set: { password: hashedPassword }
              }
            }
          );

          return successMiddleware(
            {
              message: SUCCESS_MESSAGES.USER_PASSWORD_CHANGE_SUCCESS,
              data: null
            },
            request,
            response,
            next
          );
        }
      } else {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(ERROR_MESSAGES.PASSWORD_NOT_MATCH);
      }
    } catch (error) {
      Logger.error(
        `There was an issue into changing a user's password.: ${error}`
      );
      return next(error);
    }
  };

  private createToken(user: User): TokenData {
    const expiresIn = 24 * 60 * 60;
    // const expiresIn = 5 * 60; // 5 minutes temporary for test
    const dataStoredInToken: DataStoredInToken = {
      _id: user._id, role: USER_CONSTANT.ROLES.user, deviceId: "deviceId"
    };
    return {
      expiresIn,
      token: jwt.sign(dataStoredInToken, JWT_SECRET, { expiresIn })
    };
  }

  private async getUniqueUserName() {
    let userName = '';

    while (true) {
      userName = await this.authenticationService
        .generateRandomUserNameOnlyCharacter(10)
        .toString();

      const isUser = await MongoService.findOne(this.User, {
        query: {
          userName: { $regex: new RegExp(`^${userName}$`), $options: 'i' }
        }
      });

      if (!isUser) {
        break;
      }
    }

    return userName;
  }

  public async getUniqueReferralCode() {
    let referralCode = '';

    while (true) {
      referralCode = await this.authenticationService
        .generateRandomUserName(5)
        .toString();

      if (referralCode.length == 5) {
        const isReferralCode = await MongoService.findOne(this.User, {
          query: {
            referralCode: {
              $regex: new RegExp(`^${referralCode}$`),
              $options: 'i'
            }
          }
        });

        if (!isReferralCode) {
          break;
        }
      }
    }

    return referralCode;
  }

  private registerPublisher = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { email, password } = request.body;
      let { phoneNumber, country } = request.body;

      const user = await MongoService.findOne(this.User, {
        query: { email: { $regex: new RegExp(`^${email}$`), $options: 'i' } },
        select: '_id'
      });

      if (user) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_TAKEN);
      } else {
        const userName = await this.getUniqueUserName();
        const hashedPassword = await bcrypt.hash(password, 10);

        const publisherStatus = USER_CONSTANT.PUBLISHER_STATUS.pending;
        const isReceivePromotions = true;
        const isUseCookie = true;
        const platformFee = USER_CONSTANT.DEFAULT_PLATFORM_FEE;

        const createPublisherData = {
          phoneNumber,
          country,

          role: USER_CONSTANT.ROLES.publisher,
          userName: userName,
          email,
          password: hashedPassword,

          coins: 0,
          bonus: 0,
          // totalDeposits: 0,
          // totalWithdrawals: 0,
          totalEarnings: 0,

          publisherStatus,
          isReceivePromotions,
          isUseCookie,
          platformFee
        };

        const createdPublisher = await MongoService.create(this.User, {
          insert: createPublisherData
        });

        const userData = await MongoService.findOne(this.User, {
          query: { _id: createdPublisher._id }
        });
        const tokenData: TokenData = this.createToken(createdPublisher);

        return successMiddleware(
          {
            message: SUCCESS_MESSAGES.SUCCESSFULLY_REGISTER,
            data: { userData, tokenData }
          },
          request,
          response,
          next
        );
      }
    } catch (error) {
      Logger.error(`There was an issue into register publisher.:  ${error}`);
      return next(error);
    }
  };

  private health = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      response.status(200);
      response.header('Content-type', 'text/html');

      return response.end('<h1>Test</h1>');
    } catch (error) {
      Logger.error(`There was an issue into check helth.:  ${error}`);
      return next(error);
    }
  };
}

export default AuthenticationController;
