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
    DAILY_WHEEL_BONUS_TYPE_CONSTANTS,
    STATUS_CODE,
} from '../../constant';
import dailyWheelBonusTypeModel from './dailyWheelBonusType.model';
import dailyWheelBonusTypeValidation from './dailyWheelBonusType.validation';
import { createDailyWheelBonusType } from './dailyWheelBonusType.interface';
import multer from 'multer';
import { validateFile } from '../../utils/validationFunctions';
import { uploadToS3 } from '../../utils/s3';

const upload = multer({ storage: multer.memoryStorage() })

class DailyWheelBonusTypeController implements Controller {
    public path = `/${ROUTES.DAILY_WHEEL_BONUS_TYPE}`;
    public router = Router();
    private DailyWheelBonusType = dailyWheelBonusTypeModel;
    private validation = new dailyWheelBonusTypeValidation();

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.post(
            `${this.path}`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.BONUS_EDITOR),
            upload.single('dailyWheelBonusType'),
            this.validation.adddailyWheelBonusType(),
            this.addDailyWheelBonusType
        );

        this.router.post(
            `/getDailyWheelBonusType`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.BONUS_VIEWER),
            this.getDailyWheelBonusType
        );
    }

    private addDailyWheelBonusType = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { type, isDailyWheelBonusTypeTconUpdated, title, description } = req.body;
            const isDailyWheelBonusTypeTconUpdatedBoolean = Boolean(JSON.parse(isDailyWheelBonusTypeTconUpdated));
            let createData: createDailyWheelBonusType = {}
            const isDailyWheelBonusTypeExists = await MongoService.findOne(this.DailyWheelBonusType, {
                query: { type: type }
            })

            const file = req.file
            const maxSize = DAILY_WHEEL_BONUS_TYPE_CONSTANTS.DAILY_WHEEL_BONUS_TYPE_FILE_SIZE;

            if (isDailyWheelBonusTypeTconUpdatedBoolean) {
                // validate dailyWheelBonusType file
                await validateFile(res, file, 'dailyWheelBonusType', DAILY_WHEEL_BONUS_TYPE_CONSTANTS.DAILY_WHEEL_BONUS_TYPE_EXT_ARRAY, 'dailyWheelBonusType', maxSize);

                const uploadResult = await uploadToS3(file, 'DailyWheelBonusTypes');

                if (uploadResult) {
                    createData.dailyWheelBonusIcon = uploadResult.Location;
                    createData.dailyWheelBonusIconKey = uploadResult.key;
                } else {
                    res.statusCode = STATUS_CODE.BAD_REQUEST;
                    throw new Error(
                        'There was an issue into uploading daily wheel bonus type icon on s3 server.'
                    );
                }
            }

            createData.type = type;
            createData.title = title;
            createData.description = description;
            let dailyWheelBonusType, successMessage;

            if (isDailyWheelBonusTypeExists) {
                dailyWheelBonusType = await MongoService.findOneAndUpdate(this.DailyWheelBonusType, {
                    query: { type: type },
                    updateData: { $set: createData }
                })
                successMessage = SUCCESS_MESSAGES.COMMON.UPDATE_SUCCESS.replace(':attribute', 'Daily wheel bonus type')
            } else {
                dailyWheelBonusType = await MongoService.create(this.DailyWheelBonusType, {
                    insert: createData
                })
                successMessage = SUCCESS_MESSAGES.COMMON.CREATE_SUCCESS.replace(':attribute', 'Daily wheel bonus type')
            }

            return successMiddleware(
                {
                    message: successMessage,
                    data: dailyWheelBonusType
                },
                req,
                res,
                next
            );

        } catch (error) {
            Logger.error(`There was an issue in create Daily wheel bonus type.: ${error}`);
            return next(error);
        }
    };

    private getDailyWheelBonusType = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const dailyWheelBonusConfig = await MongoService.find(this.DailyWheelBonusType, {
                select: 'type dailyWheelBonusIcon title description'
            })

            return successMiddleware(
                {
                    message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(
                        ':attribute',
                        "Daily wheel bonus type"
                    ),
                    data: dailyWheelBonusConfig
                },
                req,
                res,
                next
            );
        } catch (error) {
            Logger.error(`There was an issue in get Daily wheel bonus type.: ${error}`);
            return next(error);
        }
    };
}

export default DailyWheelBonusTypeController