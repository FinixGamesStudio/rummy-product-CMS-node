import { Router, Request, Response, NextFunction } from 'express';
import Controller from '../../interface/controller.interface';
import authMiddleware from '../../middleware/auth.middleware';
import Logger from '../../logger/index';
import { successMiddleware } from '../../middleware/responseAPI.middleware';
import { MongoService, Pagination } from '../../utils';
import roleMiddleware from '../../middleware/role.middleware';
import {
    ROUTES,
    SUCCESS_MESSAGES,
    USER_CONSTANT,
    STATUS_CODE,
    ERROR_MESSAGES,
    DAILY_WHEEL_BONUS,
    PERMISSION,
    COMMON_CONSTANT,
} from '../../constant';
import DailyWheelBonusModel from './dailyWheelBonus.model';
import DailyWheelBonusValidation from './dailyWheelBonus.validation';
import { UpdateDailyWheelBonus } from './dailyWheelBonus.interface';
import _, { includes } from 'lodash';
import dailyWheelBonusConfigModel from '../dailyWheelBonusConfig/dailyWheelBonusConfig.model';
import DailyWheelBonusTypeModel from '../dailyWheelBonusType/dailyWheelBonusType.model';
import moment from 'moment';

class DailyWheelBonusController implements Controller {
    public path = `/${ROUTES.DAILY_WHEEL_BONUS}`;
    public router = Router();
    private DailyWheelBonus = DailyWheelBonusModel;
    private validation = new DailyWheelBonusValidation()

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.post(
            `${this.path}`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.BONUS_EDITOR),
            this.validation.addDailyWheelBonus(),
            this.addDailyWheelBonus
        );

        this.router.post(
            `${this.path}/getDailyWheelBonus`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.BONUS_VIEWER),
            this.validation.getDailyWheelBonusValidation(),
            this.getDailyWheelBonus
        );

        this.router.put(
            `${this.path}`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.BONUS_EDITOR),
            this.validation.updateDailyWheelBonus(),
            this.updateDailyWheelBonus
        );

        this.router.post(
            `${this.path}/getDay`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.BONUS_VIEWER),
            this.getDailyWheelBonusDay
        );

        this.router.post(
            `${this.path}/getDailyWheelBonusType`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.BONUS_VIEWER),
            this.getDailyWheelBonusType
        );
    }

    private addDailyWheelBonus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                day,
                spinTitle,
                spinDescription
            } = req.body;

            let { bonusType } = req.body

            bonusType = bonusType.map((obj: any, index: any) => ({ ...obj, index: index + 1 }));

            const isDayExists = await MongoService.findOne(this.DailyWheelBonus, {
                query: { day: day },
                select: 'day'
            })

            if (isDayExists) {
                req.statusCode = STATUS_CODE.BAD_REQUEST;
                throw new Error(
                    ERROR_MESSAGES.COMMON.ALREADY_EXISTS.replace(':attribute', 'daily wheel bonus')
                );
            }

            const isDailyWheelBonusExists = await MongoService.findOne(dailyWheelBonusConfigModel, {})

            if (!isDailyWheelBonusExists) {
                req.statusCode = STATUS_CODE.BAD_REQUEST;
                throw new Error(ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'daily wheel bonus rows'));
            }

            if (bonusType.length != isDailyWheelBonusExists.rows) {
                req.statusCode = STATUS_CODE.BAD_REQUEST;
                throw new Error(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'daily wheel bonus type'));
            }

            const dailyWheelBonus = await MongoService.create(this.DailyWheelBonus, {
                insert: {
                    day: day,
                    spinTitle: spinTitle,
                    spinDescription: spinDescription,
                    bonusType: bonusType
                }
            })
            return successMiddleware(
                {
                    message: SUCCESS_MESSAGES.COMMON.CREATE_SUCCESS.replace(':attribute', 'Daily Spin'),
                    data: dailyWheelBonus
                },
                req,
                res,
                next
            );
        } catch (error) {
            Logger.error(`There was an issue in create daily wheel bonus.: ${error}`);
            return next(error);
        }
    };

    private getDailyWheelBonus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { start, limit } = req.body
            const dailyWheelBonus = await Pagination(this.DailyWheelBonus, {
                sort: { 'day': 1 },
                offset: start,
                limit
            })

            return successMiddleware(
                {
                    message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(
                        ':attribute',
                        "Daily wheel bonus"
                    ),
                    data: dailyWheelBonus
                },
                req,
                res,
                next
            );

        } catch (error) {
            Logger.error(`There was an issue in fetch daily wheel bonus.: ${error}`);
            return next(error);
        }
    };

    private getDailyWheelBonusType = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const dailyWheelBonusType = await MongoService.find(DailyWheelBonusTypeModel, {
                query: {},
                select: 'type'
            })
            const isdailyWheelBonusConfigExists = await MongoService.findOne(dailyWheelBonusConfigModel, {})

            const dailyWheelBonusTypeCounter = isdailyWheelBonusConfigExists ? isdailyWheelBonusConfigExists.rows : 0

            return successMiddleware(
                {
                    message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(
                        ':attribute',
                        "Daily wheel bonus type"
                    ),
                    data: { dailyWheelBonusType, dailyWheelBonusTypeCounter }
                },
                req,
                res,
                next
            );

        } catch (error) {
            Logger.error(`There was an issue in fetch daily wheel bonus type.: ${error}`);
            return next(error);
        }
    };

    private updateDailyWheelBonus = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const {
                dailyWheelBonusId,
                spinTitle,
                spinDescription
            } = req.body;

            let { bonusType } = req.body

            bonusType = bonusType.map((obj: any, index: any) => ({ ...obj, index: index + 1 }));

            let updateData: UpdateDailyWheelBonus = {};

            const isDailyWheelBonusExits = await MongoService.findOne(this.DailyWheelBonus, {
                query: { _id: dailyWheelBonusId },
                select: 'day'
            })

            if (!isDailyWheelBonusExits) {
                res.statusCode = STATUS_CODE.BAD_REQUEST;
                throw new Error(ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'daily wheel bonus'));
            }

            updateData.spinTitle = spinTitle;
            updateData.spinDescription = spinDescription;
            updateData.bonusType = bonusType;

            const dailyWheelBonus = await MongoService.findOneAndUpdate(this.DailyWheelBonus, {
                query: { _id: dailyWheelBonusId },
                updateData: {
                    $set: updateData
                }
            })
            return successMiddleware(
                {
                    message: SUCCESS_MESSAGES.COMMON.UPDATE_SUCCESS.replace(':attribute', 'Daily Spin'),
                    data: dailyWheelBonus
                },
                req,
                res,
                next
            );
        } catch (error) {
            Logger.error(`There was an issue into updating a daily wheel bonus.: ${error}`);
            return next(error);
        }

    };

    private getDailyWheelBonusDay = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let responseMessage = SUCCESS_MESSAGES.DAILY_WHEEL_BONUS.ALL_DAYS_EXISTS;
            let isDaysAvalible = false;
            const availableDays = await DailyWheelBonusModel.distinct('day');
            const allDays = DAILY_WHEEL_BONUS.DAILY_WHEEL_BONUS_DAYS
            const remaingDays = allDays.filter(day => !availableDays.includes(day))

            if (remaingDays.length > 0) {
                isDaysAvalible = true;
                responseMessage = SUCCESS_MESSAGES.DAILY_WHEEL_BONUS.DAYS_AVAILABLE
            }
            return successMiddleware(
                {
                    message: responseMessage,
                    data: { isDaysAvalible, remaingDays }
                },
                req,
                res,
                next
            );
        } catch (error) {
            Logger.error(`There was an issue in fetch daily wheel bonus day.: ${error}`);
            return next(error);
        }
    };

}

export default DailyWheelBonusController

