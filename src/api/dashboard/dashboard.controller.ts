import { Router, Request, Response, NextFunction } from 'express';
import Controller from '../../interface/controller.interface';
import authMiddleware from '../../middleware/auth.middleware';
import gameModel from '../game/game.model';
import roleMiddleware from '../../middleware/role.middleware';
import { successMiddleware } from '../../middleware/responseAPI.middleware';
import Logger from '../../logger/index';
import {
  ROUTES,
  SUCCESS_MESSAGES,
  USER_CONSTANT,
  PERMISSION
} from '../../constant';
import moment from 'moment';
import _ from 'lodash';
import UserModel from '../user/user.model';
import UsersGameRunningStatusModel from '../usersGameRunningStatus/usersGameRunningStatus.model';

class DashboardController implements Controller {
  public path = `/${ROUTES.DASHBOARD}`;
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      authMiddleware,
      roleMiddleware(
        [
          USER_CONSTANT.ROLES.admin,
          USER_CONSTANT.ROLES.adminUser,
          USER_CONSTANT.ROLES.subAdminUser
        ],
        PERMISSION.DASHBOARD_VIEWER
      ),
      this.dashboard
    );
  }

  private dashboard = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let startDate: any = new Date();
      let endDate: any = new Date();

      const last7DaysStartDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate() - 5
      );
      console.log('last7DaysStartDate :>> ', last7DaysStartDate);

      const last30DaysStartDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate() - 28
      );
      console.log('last30DaysStartDate :>> ', last30DaysStartDate);
      
      startDate = moment(startDate).startOf('day');
      endDate = moment(endDate).endOf('day');

      const getActivePlayers = {
        updatedAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        },
        role: USER_CONSTANT.ROLES.user,
        isBot: false,
      };

      const getTodaysUserAddition = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        },
        role: USER_CONSTANT.ROLES.user,
        isBot: false,
      };

      const getlast7DaysUserAddition = {
        createdAt: {
          $gte: new Date(last7DaysStartDate),
          $lte: new Date(endDate)
        },
        role: USER_CONSTANT.ROLES.user,
        isBot: false,
      };

      const getlast30DaysUserAddition = {
        createdAt: {
          $gte: new Date(last30DaysStartDate),
          $lte: new Date(endDate)
        },
        role: USER_CONSTANT.ROLES.user,
        isBot: false,
      };

      const totalPlayers = await UserModel.count({
        role: USER_CONSTANT.ROLES.user,
        isBot: false,
      });

      const [activePlayers, currentPlayers, todaysUserAddition, last7DaysUserAddition, last30DaysUserAddition] =
        await Promise.all([
          UserModel.count(getActivePlayers),
          UsersGameRunningStatusModel.count(),
          UserModel.count(getTodaysUserAddition),
          UserModel.count(getlast7DaysUserAddition),
          UserModel.count(getlast30DaysUserAddition)
        ]);

      const dashboard = {
        totalPlayers,
        activePlayers,
        currentPlayers,
        todaysUserAddition,
        last7DaysUserAddition,
        last30DaysUserAddition
      };
      console.log('dashboard :==>> ', dashboard);

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(
            ':attribute',
            'Dashboard'
          ),
          data: dashboard
        },
        req,
        res,
        next
      );
    } catch (error) {
      Logger.error(`There was an issue in fetch dashboard.: ${error}`);
      return next(error);
    }
  };
}

export default DashboardController;
