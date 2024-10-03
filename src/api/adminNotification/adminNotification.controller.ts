import { Router, Request, Response, NextFunction } from 'express';
import { MongoService, Pagination } from '../../utils';
import authMiddleware from '../../middleware/auth.middleware';
import Logger from '../../logger/index';
import { successMiddleware } from '../../middleware/responseAPI.middleware';
import roleMiddleware from '../../middleware/role.middleware';
import {
  ROUTES,
  SUCCESS_MESSAGES,
  USER_CONSTANT,
  ADMIN_NOTIFICATION_CONSTANT
} from '../../constant';
import AdminNotificationModel from './adminNotification.model';
import Controller from '../../interface/controller.interface';
import AdminNotificationValidation from './adminNotification.validation';
import { CreateAdminNotificationData } from './adminNotification.interface';

class AdminNotificationController implements Controller {
  public path = `/${ROUTES.ADMIN_NOTIFICATION}`;
  public router = Router();
  private validation = new AdminNotificationValidation();

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/getNotifications`,
      authMiddleware,
      roleMiddleware([
        USER_CONSTANT.ROLES.admin,
        USER_CONSTANT.ROLES.adminUser,
        USER_CONSTANT.ROLES.subAdminUser
      ]),
      this.validation.getNotificationsValidation(),
      this.getNotifications
    );

    this.router.post(
      `${this.path}/markAsReadNotification`,
      authMiddleware,
      roleMiddleware([
        USER_CONSTANT.ROLES.admin,
        USER_CONSTANT.ROLES.adminUser,
        USER_CONSTANT.ROLES.subAdminUser
      ]),
      this.validation.markAsReadNotificationValidation(),
      this.markAsReadNotification
    );

    this.router.post(
      `${this.path}/markAsReadAllNotification`,
      authMiddleware,
      roleMiddleware([
        USER_CONSTANT.ROLES.admin,
        USER_CONSTANT.ROLES.adminUser,
        USER_CONSTANT.ROLES.subAdminUser
      ]),
      this.markAsReadAllNotification
    );

    this.router.post(
      `${this.path}/deleteAllNotification`,
      authMiddleware,
      roleMiddleware([
        USER_CONSTANT.ROLES.admin,
        USER_CONSTANT.ROLES.adminUser,
        USER_CONSTANT.ROLES.subAdminUser
      ]),
      this.deleteAllNotification
    );

    this.router.post(
      `${this.path}/getUnreadNotificationCount`,
      authMiddleware,
      roleMiddleware([
        USER_CONSTANT.ROLES.admin,
        USER_CONSTANT.ROLES.adminUser,
        USER_CONSTANT.ROLES.subAdminUser
      ]),
      this.getUnreadNotificationCount
    );
  }

  private getNotifications = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { start, limit } = request.body;

      const notifiactions = await Pagination(AdminNotificationModel, {
        populate: [
          { path: 'userId', select: 'nickName profileImage' },
          { path: 'notificationData.reportedUserId', select: 'nickName' },
          { path: 'notificationData.blockedUserId', select: 'nickName' }
        ],
        offset: start,
        limit,
        sort: { isRead: 1, createdAt: -1 }
      });

      const responseData: any = [];

      if(notifiactions && notifiactions.docs) {
        const docs: any = notifiactions.docs;

        for(let i = 0; i < docs.length; i++) {
          const record = docs[i];
          
          const responseObj = {
            _id: record._id,
            userId: record.userId,
            notificationCategory: record.notificationCategory,
            createdAt: record.createdAt,
            notificationTitle: await this.getNotificationTitle(record),
            isRead: record.isRead,
          }

          responseData.push(responseObj);
        }
      }

      notifiactions.docs = responseData;

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(':attribute', 'Notifications'),
          data: notifiactions
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(`There was an issue into fetching unread admin notifiaction.: ${error}`);
      return next(error);
    }
  };

  private markAsReadNotification = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { adminNotificationId } = request.body;

      let notifiaction = await MongoService.findOne(AdminNotificationModel, {
        query: { _id: adminNotificationId, isRead: false }
      });

      if(notifiaction) {
        const now = new Date();

        notifiaction = await MongoService.findOneAndUpdate(AdminNotificationModel, {
          query: { _id: adminNotificationId },
          updateData: { isRead: true, readAt: now }
        });
      }

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.READ_SUCCESS.replace(':attribute', 'Notification'),
          data: notifiaction
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(`There was an issue into mark as read admin notifiaction.: ${error}`);
      return next(error);
    }
  };

  private markAsReadAllNotification = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const now = new Date();

      const notifications = await MongoService.updateMany(AdminNotificationModel, {
        query: { isRead: false },
        updateData: { isRead: true, readAt: now }
      });

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.READ_SUCCESS.replace(':attribute', 'Notifications'),
          data: notifications
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(`There was an issue into mark as read all admin notifiactions.: ${error}`);
      return next(error);
    }
  };

  private deleteAllNotification = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const notifications = await MongoService.deleteMany(AdminNotificationModel, {});

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.DELETE_SUCCESS.replace(':attribute', 'Notifications'),
          data: notifications
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(`There was an issue into deleting all admin notifiactions.: ${error}`);
      return next(error);
    }
  };

  private getUnreadNotificationCount = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const notificationsCount = await MongoService.countDocuments(AdminNotificationModel, {
        query: { isRead: false },
      });

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(':attribute', 'Unread notification count'),
          data: notificationsCount
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(`There was an issue into fetching unread admin notifiactions count.: ${error}`);
      return next(error);
    }
  };

  public async createAdminNotification(data: CreateAdminNotificationData) {
    const createdRecord = await MongoService.create(AdminNotificationModel, { insert: data });

    return createdRecord;
  }

  public async getNotificationTitle(data: any): Promise<String> {
    const notificationCategory = data.notificationCategory;
    const allCategory = ADMIN_NOTIFICATION_CONSTANT.NOTIFICATION_CATEGORY_OBJ;
    
    let userName = '';
    let title = '';

    if(data && data.userId && data.userId.nickName) {
      userName = data.userId.nickName;
    }
    
    if(notificationCategory == allCategory.blockUser) {
      let blockedUserName = '';
      title = ADMIN_NOTIFICATION_CONSTANT.NOTIFICATION_TITLE.blockUser;
      const notificationData = data.notificationData;

      if(notificationData && notificationData.blockedUserId && notificationData.blockedUserId.nickName) {
        blockedUserName = notificationData.blockedUserId.nickName;
      }

      title = title.replace(':blockedUserName', blockedUserName);
    } 

    title = title.replace(':userName', userName);

    return title;
  }
}

export default AdminNotificationController;