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
    PERMISSION,
} from '../../constant';
import dailyWheelBonusConfigModel from './dailyWheelBonusConfig.model';
import dailyWheelBonusConfigValidation from './dailyWheelBonusConfig.validation';

class dailyWheelBonusConfigController implements Controller {
    public path = `/${ROUTES.DAILY_WHEEL_BONUS_CONFIG}`;
    public router = Router();
    private validation = new dailyWheelBonusConfigValidation()

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.post(
            `${this.path}`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.BONUS_EDITOR),
            this.validation.adddailyWheelBonusConfig(),
            this.adddailyWheelBonusConfig
        );

        this.router.post(
            `${this.path}/getDailyWheelBonusConfig`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.BONUS_VIEWER),            
            this.getDailyWheelBonusConfig
        );
    }

    private adddailyWheelBonusConfig = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { rows } = req.body;

            const isdailyWheelBonusConfigExists = await MongoService.findOne(dailyWheelBonusConfigModel, {
                query: {},
                select: '_id'
            })

            const updateData = {
                rows
            }

            let dailyWheelBonus, successMessage = SUCCESS_MESSAGES.COMMON.UPDATE_SUCCESS.replace(':attribute', 'Daily wheel bonus config')
            if (isdailyWheelBonusConfigExists) {
                dailyWheelBonus = await MongoService.findOneAndUpdate(dailyWheelBonusConfigModel, {
                    query: {},
                    updateData: {
                        $set: updateData
                    }
                })
            } else {
                successMessage = SUCCESS_MESSAGES.COMMON.CREATE_SUCCESS.replace(':attribute', 'Daily wheel bonus config')
                dailyWheelBonus = await MongoService.create(dailyWheelBonusConfigModel, {
                    insert: updateData
                })
            }

            return successMiddleware(
                {
                    message: successMessage,
                    data: dailyWheelBonus
                },
                req,
                res,
                next
            );
        } catch (error) {
            Logger.error(`There was an issue in create Daily wheel bonus config.: ${error}`);
            return next(error);
        }
    };

    private getDailyWheelBonusConfig = async (req: Request, res: Response, next: NextFunction) => {
        try {         
            const dailyWheelBonusConfig = await MongoService.findOne(dailyWheelBonusConfigModel, {})            

            return successMiddleware(
                {
                    message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(
                        ':attribute',
                        "Daily wheel bonus config"
                    ),
                    data: dailyWheelBonusConfig
                },
                req,
                res,
                next
            );
        } catch (error) {
            Logger.error(`There was an issue in fetching daily wheel bonus config.: ${error}`);
            return next(error);
        }
    };
}

export default dailyWheelBonusConfigController

