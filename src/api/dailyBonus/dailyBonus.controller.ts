import { Router, Request, Response, NextFunction } from 'express';
import Controller from "../../interface/controller.interface"
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
    PERMISSION,
} from '../../constant';
import DailyBonusModel from '../dailyBonus/dailyBonus.model';
import DailyBonusValidation from './dailyBonus.validation';

class DailyBonusController implements Controller {
    public path = `/${ROUTES.DAILY_BONUS}`;
    public router = Router();
    private DailyBonus = DailyBonusModel;
    private validation = new DailyBonusValidation()

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.post(
            `${this.path}`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.BONUS_EDITOR),
            this.validation.addDailyBonus(),
            this.addDailyBonus
        );

        this.router.post(
            `${this.path}/getDailyBonus`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.BONUS_VIEWER),
            this.validation.getDailyBonusValidation(),
            this.getDailyBonus
        );

        this.router.put(
            `${this.path}`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.BONUS_EDITOR),
            this.validation.updateDailyBonus(),
            this.updateDailyBonus
        );
    }

    private addDailyBonus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { day, bonus } = req.body;

            const isDayExists = await MongoService.findOne(this.DailyBonus, {
                query: { day: day },
                select: 'day'
            })

            if (isDayExists) {
                req.statusCode = STATUS_CODE.BAD_REQUEST;
                throw new Error(
                    ERROR_MESSAGES.COMMON.ALREADY_EXISTS.replace(':attribute', 'daily bonus')
                );
            }

            const dailyWheelBonus = await MongoService.create(this.DailyBonus, {
                insert: {
                    day: day,
                    bonus: bonus
                }
            })
            return successMiddleware(
                {
                    message: SUCCESS_MESSAGES.COMMON.CREATE_SUCCESS.replace(':attribute', 'Daily bonus'),
                    data: dailyWheelBonus
                },
                req,
                res,
                next
            );
        } catch (error) {
            Logger.error(`There was an issue in create daily bonus.: ${error}`);
            return next(error);
        }
    };

    private getDailyBonus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { start, limit } = req.body
            const pageStart = start ? start : 0;
            const pageLimit = limit ? limit : 10;

            const dailyBonus = await Pagination(this.DailyBonus, {
                sort: { 'day': 1 },
                offset: pageStart,
                limit: pageLimit
            })

            return successMiddleware(
                {
                    message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(
                        ':attribute',
                        "Daily bonus"
                    ),
                    data: dailyBonus
                },
                req,
                res,
                next
            );

        } catch (error) {
            Logger.error(`There was an issue in fetch daily bonus.: ${error}`);
            return next(error);
        }
    };

    private updateDailyBonus = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const { dailyBonusId, day, bonus } = req.body;

            const isDayExists = await MongoService.findOne(this.DailyBonus, {
                query: { day: day },
                select: 'day'
            })

            if (!isDayExists) {
                req.statusCode = STATUS_CODE.BAD_REQUEST;
                throw new Error(
                    ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'daily bonus')
                );
            }

            let updateData: any = {};
            updateData.day = day;
            updateData.bonus = bonus;

            const dailyWheelBonus = await MongoService.findOneAndUpdate(this.DailyBonus, {
                query: { _id: dailyBonusId },
                updateData: {
                    $set: updateData
                }
            })
            return successMiddleware(
                {
                    message: SUCCESS_MESSAGES.COMMON.UPDATE_SUCCESS.replace(':attribute', 'daily bonus'),
                    data: dailyWheelBonus
                },
                req,
                res,
                next
            );
        } catch (error) {
            Logger.error(`There was an issue into updating a daily bonus.: ${error}`);
            return next(error);
        }
    };

}

export default DailyBonusController;

