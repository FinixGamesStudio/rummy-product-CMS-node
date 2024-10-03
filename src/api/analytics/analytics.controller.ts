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
  ERROR_MESSAGES,
  STATUS_CODE,
  USER_CONSTANT,
  PERMISSION,
} from '../../constant';
import moment from 'moment';
import AnalyticsValidation from './analytics.valiadation';
import AnalyticsCommon from './analytics.common';
import { MongoService } from '../../utils';
import userModel from '../user/user.model';
import { exportFileFunction } from '../../utils/exportFileFunction';
import _ from 'lodash';
import DailyReportsCommon from './dailyReports.common';
import userDailyActiveStatusModel from '../userDailyActiveStatus/userDailyActiveStatus.model';
import UserModel from '../user/user.model';


class AnalyticsController implements Controller {
  public path = `/${ROUTES.ANALYTICS}`;
  public router = Router();
  private validation = new AnalyticsValidation();
  private analyticsCommon = new AnalyticsCommon();
  private User = userModel;
  private userDailyActiveStatus = userDailyActiveStatusModel;
  private DailyReportsCommon = new DailyReportsCommon();


  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    this.router.post(
      `${this.path}`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.ANALYTICS_VIEWER),
      this.validation.getReportValidation(),
      this.reportController
    );

    this.router.post(
      `${this.path}/getDailyReport`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.ANALYTICS_VIEWER),
      this.validation.getDailyReportValidation(),
      this.getDailyReport
    );

    this.router.post(
      `${this.path}/getUserInstalledGame`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.ANALYTICS_VIEWER),
      this.validation.getUserIntalledValidation(),
      this.getUserInstalled
    );

  }

  private reportController = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { csvDownload, exportFile } = req.body;
      let { startDate, endDate, start, limit } = req.body;
      let query: any = {}
      start = parseInt(start);
      limit = parseInt(limit);
      const aggregategetdailyActiveUserReport = await this.analyticsCommon.aggregatedailyActiveUserReport();
      const aggregateDailyNewUserReport = await this.analyticsCommon.aggregateDailyNewUserReport();
      const aggregateMonthlyActiveUserReport = await this.analyticsCommon.aggregateMonthlyActiveUserReport();

      if (startDate && endDate) {
        ``
        let startDate1: any = moment(startDate);
        let endDate1:any = moment(endDate);
        const isEndDateGrater = endDate1.isSameOrAfter(startDate1);
        const aggregateMonthlyGetMonth = `0${new Date(endDate1).getMonth() + 1}`;
        const aggregateMonthlyGetMonthFormate = aggregateMonthlyGetMonth.slice(-2);
        console.log('aggregateMonthlyGetMonthFormate :>> ', aggregateMonthlyGetMonthFormate);

        const aggregateMonthlyGetYear = new Date(startDate1).getFullYear();
        if (isEndDateGrater) {
          query = {
            ...query,
            date: {
              $gte: startDate,
              $lte: endDate
            }
          };
        } else {
          res.statusCode = STATUS_CODE.NOT_FOUND;
          throw new Error(
            ERROR_MESSAGES.COMMON.GRATER.replace(
              ':attribute',
              'endDate'
            ).replace(':another', 'startDate')
          );
        }

        aggregategetdailyActiveUserReport[4]['$match']['date'] = query.date;
        aggregateDailyNewUserReport[1]['$match']['date'] = query.date;
        aggregateMonthlyActiveUserReport[1]['$match']['date'] = `${aggregateMonthlyGetYear}-${aggregateMonthlyGetMonthFormate}`
      }

      let dailyActiveUserReport = await MongoService.aggregate(this.userDailyActiveStatus, aggregategetdailyActiveUserReport);
      let dailyNewUserReport = await MongoService.aggregate(this.User, aggregateDailyNewUserReport);
      let monthlyActiveUserReport = await MongoService.aggregate(this.User, aggregateMonthlyActiveUserReport);

      let totalDailyActiveUserReport = 0;
      for (let i = 0; i < dailyActiveUserReport.length; i++) {
        totalDailyActiveUserReport = totalDailyActiveUserReport + dailyActiveUserReport[i].Total
      }

      let totalDailyNewUserReport = 0;
      for (let i = 0; i < dailyNewUserReport.length; i++) {
        totalDailyNewUserReport = totalDailyNewUserReport + dailyNewUserReport[i].Total
      }
      let totalmonthlyActiveUserReport = 0;
      for (let i = 0; i < monthlyActiveUserReport.length; i++) {
        totalmonthlyActiveUserReport = totalmonthlyActiveUserReport + monthlyActiveUserReport[i].Total
      }


      let isExportFileBoolean;
      if (exportFile) {
        isExportFileBoolean = Boolean(JSON.parse(exportFile));
      }
      if (isExportFileBoolean) {
        const iscsvDownloadBoolean = Boolean(JSON.parse(csvDownload));
        dailyNewUserReport = await exportFileFunction(iscsvDownloadBoolean, 'dailyNewUserReport', dailyNewUserReport, res, req, next);
        monthlyActiveUserReport = await exportFileFunction(iscsvDownloadBoolean, 'monthlyActiveUserReport', monthlyActiveUserReport, res, req, next);

      } else {
        return successMiddleware(
          {
            message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(
              ':attribute',
              "Report"
            ),
            data: {
              dailyNewUserReport,
              totalDailyNewUserReport,
              monthlyActiveUserReport,
              totalmonthlyActiveUserReport,
              dailyActiveUserReport,
              totalDailyActiveUserReport,
            }
          },
          req,
          res,
          next
        );
      }
    } catch (error) {
      Logger.error(`There was an issue in fetch report.: ${error}`);
      return next(error);
    }
  };

  private getDailyReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let { csvDownload, exportFile } = req.body;
      let { startDate, endDate } = req.body;
      let query: any = {};
      let startDateStr = startDate;
      let endDateStr = endDate;

      if (exportFile != undefined && csvDownload != undefined) {
        exportFile = Boolean(JSON.parse(exportFile));
        csvDownload = Boolean(JSON.parse(csvDownload));
      }

      if (startDate && endDate) {
        startDate = moment(startDate).startOf('day');
        endDate = moment(endDate).endOf('day');
        const isEndDateGrater = endDate.isSameOrAfter(startDate);

        if (isEndDateGrater) {
          query = {
            ...query,
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          };
        } else {
          res.statusCode = STATUS_CODE.NOT_FOUND;
          throw new Error(
            ERROR_MESSAGES.COMMON.GRATER.replace(
              ':attribute',
              'endDate'
            ).replace(':another', 'startDate')
          );
        }
      }

      const getInstallQuery = {
        ...query,
        role: USER_CONSTANT.ROLES.user,
        isBot: false
      };

      const aggrGetDailyActiveUsers = await this.DailyReportsCommon.aggrGetDailyActiveUsers(query);
      console.log('aggrGetDailyActiveUsers :>> ', JSON.stringify(aggrGetDailyActiveUsers));
      const aggrGetDailyInstalls = await this.DailyReportsCommon.aggrGetDailyInstalls(getInstallQuery);

      const dailyActiveUser =
        await MongoService.aggregate(userDailyActiveStatusModel, aggrGetDailyActiveUsers);

      const dailyInstalls =
        await MongoService.aggregate(userModel, aggrGetDailyInstalls);

      let totalActiveUsers = 0;
      let totalInstalls = 0;

      const responseData = [];
      const loopStartDate = moment(startDateStr);
      const loopEndDate = moment(endDateStr);

      for (let m = moment(loopStartDate); m.isSameOrBefore(loopEndDate); m.add(1, 'days')) {
        const dateStr = m.format('YYYY-MM-DD');

        const activeUser = dailyActiveUser.filter((row: any) => (row.date === dateStr))[0];
        const activeUserCount = activeUser?.count ?? 0;

        const installs = dailyInstalls.filter((row: any) => (row.date === dateStr))[0];
        const installsCount = installs?.count ?? 0;

        if (
          activeUserCount ||
          installsCount
        ) {
          const obj = {
            date: dateStr,
            dailyInstalls: installsCount,
            dailyActiveUser: activeUserCount
          };

          // calculate totals
          totalActiveUsers = totalActiveUsers + activeUserCount;
          totalInstalls = totalInstalls + installsCount;

          responseData.push(obj);
        }
      }


      const totals = {
        totalActiveUsers,
        totalInstalls,
      };
      Logger.info(` getDailyReport :: totals :: ==>> ${totals}`);
      Logger.info(` getDailyReport :: responseData :: ==>> ${responseData}`);

      if (exportFile) {
        let exportResponseData = [];
        for (let i = 0; i < responseData.length; i++) {
          const record = responseData[i];
          exportResponseData.push({
            'Sr.No.': i + 1,
            'Date': record.date ? record.date : "",
            'Daily Downloads': record.dailyInstalls ? record.dailyInstalls : 0,
            'Daily Active Users': record.dailyActiveUser ? record.dailyActiveUser : 0
          });
        }

        await exportFileFunction(csvDownload, 'DailyReport', exportResponseData, res, req, next);
      } else {
        return successMiddleware(
          {
            message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(
              ':attribute',
              "Daily report"
            ),
            data: {
              totals,
              responseData,
            }
          },
          req,
          res,
          next
        );
      }
    } catch (error) {
      Logger.error(`There was an issue in fetching daily report.: ${error}`);
      return next(error);
    }
  };

  private getUserInstalled = async (req: Request, res: Response, next: NextFunction) => {
    try {

      let { startDate, endDate } = req.body;

      let query: any = {};

      query = { ...query, role: USER_CONSTANT.ROLES.user, isBot: false };

      if (startDate && endDate) {
        startDate = moment(startDate).startOf('day');
        endDate = moment(endDate).endOf('day');
        const isEndDateGrater = endDate.isSameOrAfter(startDate);

        if (isEndDateGrater) {
          query = {
            ...query,
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          };
        } else {
          res.statusCode = STATUS_CODE.NOT_FOUND;
          throw new Error(
            ERROR_MESSAGES.COMMON.GRATER.replace(
              ':attribute',
              'endDate'
            ).replace(':another', 'startDate')
          );
        }
      }

      const userInstalled = await MongoService.countDocuments(UserModel, { query })
      Logger.info(`user installed  ::==>> ${userInstalled}`);

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(
            ':attribute',
            "User installed"
          ),
          data: userInstalled
        },
        req,
        res,
        next
      );
    } catch (error) {
      Logger.error(`There was an issue in fetch user installed MGP app: ${error}`);
      return next(error);
    }
  };
}

export default AnalyticsController;
