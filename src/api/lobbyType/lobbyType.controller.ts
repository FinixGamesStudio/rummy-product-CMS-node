import { Router, Request, Response, NextFunction, response } from 'express';
import { MongoService, Pagination } from '../../utils';
import authMiddleware from '../../middleware/auth.middleware';
import Logger from '../../logger/index';
import { successMiddleware } from '../../middleware/responseAPI.middleware';
import { validateFile } from '../../utils/validationFunctions';
import roleMiddleware from '../../middleware/role.middleware';
import {
    ROUTES,
    SUCCESS_MESSAGES,
    ERROR_MESSAGES,
    STATUS_CODE,
    PERMISSION,
    USER_CONSTANT,
    LOBBY_TYPE_CONSTANTS
} from '../../constant';
import multer from 'multer';
import { uploadToS3 } from '../../utils/s3';
import Controller from '../../interface/controller.interface';
import LobbyTypeModel from './lobbyType.Model';
import LobbyTypeValidation from './lobbyType.validation';
import { UpdateLobbyType } from './lobbyType.Interface';
const upload = multer({ storage: multer.memoryStorage() })


class LobbyTypeController implements Controller {
    public path = `/${ROUTES.LOBBY_TYPE}`;
    public router = Router();
    private LobbyType = LobbyTypeModel;
    private validation = new LobbyTypeValidation()

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes() {

        this.router.post(
            `${this.path}`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin]),
            upload.single('lobbyTypeIcon'),
            this.validation.addLobbyTypeValidation(),
            this.addLobbyType
        );

        this.router.post(
            `${this.path}/getLobbyType`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin]),
            this.validation.getLobbyTypeValidation(),
            this.getLobbyTypes
        );

        this.router.put(
            `${this.path}`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin]),
            upload.single('lobbyTypeIcon'),
            this.validation.updateLobbyTypeValidation(),
            this.updateLobbyType
        );

        this.router.delete(
            `${this.path}`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin]),
            this.validation.deleteLobbyTypeValidation(),
            this.deleteLobbyType
        );

        this.router.post(
            `${this.path}/getAllLobbyTypes`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin]),
            this.getAllLobbyTypes
        );
    }

    private addLobbyType = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { lobbyType, description, type } = req.body;

            const isLobbyTypeExits = await MongoService.findOne(this.LobbyType, {
                query: {
                    lobbyType: { $regex: new RegExp(`^${lobbyType}$`), $options: 'i' }
                }
            });

            if (isLobbyTypeExits) {
                res.statusCode = STATUS_CODE.BAD_REQUEST;
                throw new Error(
                    ERROR_MESSAGES.COMMON.ALREADY_EXISTS.replace(':attribute', 'lobbyType')
                );
            }

            const file = req.file
            const maxSize = LOBBY_TYPE_CONSTANTS.LABEL_ICON_FILE_SIZE;

            // validate lobbyTypeIcon file
            await validateFile(res, file, 'lobbyTypeIcon', LOBBY_TYPE_CONSTANTS.LABEL_ICON_EXT_ARRAY, 'lobbyTypeIcon', maxSize);

            const uploadResult = await uploadToS3(file, 'LobbyTypeIcons');

            if (uploadResult) {
                const addLobbyType = await MongoService.create(this.LobbyType, {
                    insert: {
                        lobbyType: lobbyType,
                        description: description,
                        type: type,
                        lobbyTypeIcon: uploadResult.Location,
                        lobbyTypeIconKey: uploadResult.key
                    }
                })
                return successMiddleware(
                    {
                        message: SUCCESS_MESSAGES.COMMON.CREATE_SUCCESS.replace(
                            ':attribute',
                            'Lobby type'
                        ),
                        data: addLobbyType
                    },
                    req,
                    res,
                    next
                );
            } else {
                response.statusCode = STATUS_CODE.BAD_REQUEST;
                throw new Error(
                    'There was an issue into uploading lobby type icon on s3 server.'
                );
            }
        } catch (error) {
            Logger.error(`There was an issue in create lobby type.: ${error}`);
            return next(error);
        }
    };

    private getLobbyTypes = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { start, limit } = req.body
            const lobbyTypes = await Pagination(this.LobbyType, {
                offset: start,
                limit
            })

            return successMiddleware(
                {
                    message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(
                        ':attribute',
                        "Lobby types"
                    ),
                    data: lobbyTypes
                },
                req,
                res,
                next
            );

        } catch (error) {
            Logger.error(`There was an issue in fetch lobby types.: ${error}`);
            return next(error);
        }
    };

    private updateLobbyType = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { lobbyTypeId, lobbyType, isLobbyTypeIconUpdated, description, type } = req.body;
            let updateData: UpdateLobbyType = {};
            const isLobbyTypeIconUpdatedBoolean = Boolean(JSON.parse(isLobbyTypeIconUpdated));

            const isLobbyTypeExits = await MongoService.findOne(this.LobbyType, {
                query: { _id: lobbyTypeId },
            })

            if (!isLobbyTypeExits) {
                response.statusCode = STATUS_CODE.BAD_REQUEST;
                throw new Error(
                    ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'lobby type')
                );
            }

            const isLobbyTypeNameExits = await MongoService.findOne(this.LobbyType, {
                query: {
                    _id: { $ne: lobbyTypeId },
                    lobbyType: { $regex: new RegExp(`^${lobbyType}$`), $options: 'i' }
                }
            });

            if (isLobbyTypeNameExits) {
                res.statusCode = STATUS_CODE.BAD_REQUEST;
                throw new Error(
                    ERROR_MESSAGES.COMMON.ALREADY_EXISTS.replace(':attribute', 'lobby type name')
                );
            }

            if (isLobbyTypeIconUpdatedBoolean) {
                const file = req.file
                const maxSize = LOBBY_TYPE_CONSTANTS.LABEL_ICON_FILE_SIZE;

                // validate lobbyTypeIcon file
                await validateFile(res, file, 'lobbyTypeIcon', LOBBY_TYPE_CONSTANTS.LABEL_ICON_EXT_ARRAY, 'lobbyTypeIcon', maxSize);

                // Note : User has not access to deletefile. And permission also not given beacuse risk of delete bucket.
                // const deleteImageResult = await deleteFromS3(isLobbyTypeExits.lobbyTypeIconKey);

                const uploadResult = await uploadToS3(file, 'LobbyTypeIcons');

                if (uploadResult) {
                    updateData.lobbyTypeIcon = uploadResult.Location;
                    updateData.lobbyTypeIconKey = uploadResult.key;
                } else {
                    response.statusCode = STATUS_CODE.BAD_REQUEST;
                    throw new Error(
                        'There was an issue into uploading lobby type icon on s3 server.'
                    );
                }
            }

            updateData.lobbyType = lobbyType;
            updateData.description = description;
            updateData.type = type;

            const updateLobbyType = await MongoService.findOneAndUpdate(this.LobbyType, {
                query: { _id: lobbyTypeId },
                updateData: updateData
            })
            return successMiddleware(
                {
                    message: SUCCESS_MESSAGES.COMMON.UPDATE_SUCCESS.replace(
                        ':attribute',
                        'Lobby type'
                    ),
                    data: updateLobbyType
                },
                req,
                res,
                next
            );
        } catch (error) {
            Logger.error(`There was an issue into updating lobby type.: ${error}`);
            return next(error);
        }
    };

    private deleteLobbyType = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { lobbyTypeId } = req.body
            const lobbyType = await MongoService.findOne(this.LobbyType, {
                query: { _id: lobbyTypeId },
            })

            if (!lobbyType) {
                response.statusCode = STATUS_CODE.BAD_REQUEST;
                throw new Error(
                    ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'lobby type')
                );
            } else {

                // Note : User has not access to deletefile. And permission also not given beacuse risk of delete bucket.
                // const deleteImageResult = await deleteFromS3(lobbyType.lobbyTypeIconKey);

                const deleteResult = await MongoService.deleteOne(this.LobbyType, {
                    query: { _id: lobbyTypeId }
                });
                return successMiddleware(
                    {
                        message: SUCCESS_MESSAGES.COMMON.DELETE_SUCCESS.replace(
                            ':attribute',
                            'Lobby type'
                        ),
                        data: lobbyType
                    },
                    req,
                    res,
                    next
                );
            }
        } catch (error) {
            Logger.error(`There was an issue into deleting a lobby type.: ${error}`);
            return next(error);
        }
    };

    private getAllLobbyTypes = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const lobbyTypes = await MongoService.find(this.LobbyType, {
                select: '_id lobbyType lobbyTypeIcon description'
            })

            return successMiddleware(
                {
                    message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(
                        ':attribute',
                        "Lobby types"
                    ),
                    data: lobbyTypes
                },
                req,
                res,
                next
            );

        } catch (error) {
            Logger.error(`There was an issue in fetch lobby types.: ${error}`);
            return next(error);
        }
    };
}

export default LobbyTypeController

