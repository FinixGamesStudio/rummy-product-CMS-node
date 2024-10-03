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
    ERROR_MESSAGES,
    STATUS_CODE,
    USER_CONSTANT,
    PERMISSION,
} from '../../constant';
import GameModel from '../game/game.model';
import GameNumberOfPlayerModel from './gameNumberOfPlayer.model';
import GameNumberOfPlayerValidation from './gameNumberOfPlayer.validation';
import RequestWithUser from '../../interface/requestWithUser.interface';

class GameNumberOfPlayerController implements Controller {
    public path = `/${ROUTES.GAME_NUMBER_OF_PLAYER}`;
    public router = Router();
    private Game = GameModel;
    private GameNumberOfPlayer = GameNumberOfPlayerModel;
    private validation = new GameNumberOfPlayerValidation();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            `${this.path}`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin]),
            this.validation.createGameNumberOfPlayerValidation(),
            this.createGameNumberOfPlayer
        );

        this.router.post(
            `${this.path}/getGameNumberOfPlayer`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin]),
            this.validation.getGameNumberOfPlayerValidation(),
            this.getGameNumberOfPlayer
        );

        this.router.put(
            `${this.path}`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin]),
            this.validation.updateGameNumberOfPlayerValidate(),
            this.updateGameNumberOfPlayer
        );

        this.router.delete(
            `${this.path}`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin]),
            this.validation.deleteGameNumberOfPlayerValidate(),
            this.deleteGameNumberOfPlayer
        );

        this.router.post(
            `${this.path}/activeDeactive`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin]),
            this.validation.activeDeactiveGameNumberOfPlayerValidation(),
            this.activeDactiveGameNumberOfPlayer
        );

        this.router.post(
            `${this.path}/swapPosition`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin]),
            this.validation.swapGameNumberOfPlayerPositionValidation(),
            this.swapPosiiton
        );
    }

    private createGameNumberOfPlayer = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const request = req as RequestWithUser;
            const adminId = request.user._id;

            const { gameId, numberOfPlayer, isDefault } = req.body;
            const isDefaultBoolean = Boolean(JSON.parse(isDefault));

            const isGameExists = await MongoService.findOne(this.Game, {
                query: { _id: gameId },
                select: 'gameName'
            })

            if (!isGameExists) {
                res.statusCode = STATUS_CODE.BAD_REQUEST;
                throw new Error(
                    ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'game')
                );
            }

            const isNumberOfPlayerExists = await MongoService.findOne(this.GameNumberOfPlayer, {
                query: { gameId: gameId, numberOfPlayer },
                select: 'numberOfPlayer'
            });

            if (isNumberOfPlayerExists) {
                res.statusCode = STATUS_CODE.BAD_REQUEST;
                throw new Error(
                    ERROR_MESSAGES.COMMON.ALREADY_EXISTS.replace(':attribute', 'number of player')
                );
            }

            if (isDefaultBoolean) {
                const isDefaultNumberOfPlayerExists = await MongoService.findOne(this.GameNumberOfPlayer, {
                    query: { gameId: gameId, isDefault: true },
                    select: 'numberOfPlayer'
                });

                if (isDefaultNumberOfPlayerExists) {
                    res.statusCode = STATUS_CODE.BAD_REQUEST;
                    throw new Error(
                        ERROR_MESSAGES.COMMON.ALREADY_EXISTS.replace(':attribute', 'default number of player')
                    );
                }
            }

            const maxPosition = await MongoService.find(this.GameNumberOfPlayer, {
                query: { gameId: gameId },
                sort: {
                    "position": -1
                } as any
            });

            const numebrOfPlayer = await MongoService.create(this.GameNumberOfPlayer, {
                insert: {
                    gameId: gameId,
                    numberOfPlayer: numberOfPlayer,
                    isDefault: isDefault,
                    position: (maxPosition[0] && maxPosition[0].position) ? maxPosition[0].position + 1 : 1,
                    createAdminId: adminId,
                    updateAdminId: adminId
                }
            });

            return successMiddleware(
                {
                    message: SUCCESS_MESSAGES.COMMON.CREATE_SUCCESS.replace(
                        ':attribute',
                        'Game number of player'
                    ),
                    data: numebrOfPlayer
                },
                req,
                res,
                next
            );

        } catch (error) {
            Logger.error(`There was an issue in create game number of player.: ${error}`);
            return next(error);
        }
    };

    private getGameNumberOfPlayer = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { gameId, start, limit } = req.body;

            const isGameIdExists = await MongoService.findOne(GameModel, {
                query: { _id: gameId },
            })

            if (!isGameIdExists) {
                req.statusCode = STATUS_CODE.BAD_REQUEST;
                throw new Error(
                    ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'game')
                );
            }

            const isNoOfPlayer = isGameIdExists.isNoOfPlayer

            let query: any = { gameId: gameId }

            if (!isNoOfPlayer) {
                query = { gameId: gameId, isDefault: true }
            }


            const gameNumberOfPlayers: any = await Pagination(this.GameNumberOfPlayer, {
                query,
                populate: { path: 'gameId', select: 'gameName' },
                sort: {
                    "position": 1
                },
                offset: start,
                limit
            });

            if (gameNumberOfPlayers.docs && gameNumberOfPlayers.docs.length > 0) {
                const responseDocs = gameNumberOfPlayers.docs;

                for (let item = 0; item < responseDocs.length; item++) {
                    const obj = responseDocs[item];
                    responseDocs[item].isDeletable = true;
                }

                gameNumberOfPlayers.docs = responseDocs;
            }

            return successMiddleware(
                {
                    message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(
                        ':attribute',
                        'Game number of player'
                    ),
                    data: gameNumberOfPlayers
                },
                req,
                res,
                next
            );

        } catch (error) {
            Logger.error(`There was an issue in fetch game number of player.: ${error}`);
            return next(error);
        }
    };

    private updateGameNumberOfPlayer = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const req = request as RequestWithUser;
            const adminId = req.user._id;

            const { gameNumberOfPlayerId, numberOfPlayer, isDefault } = request.body;
            const isDefaultBoolean = Boolean(JSON.parse(isDefault));

            const isGameNumberOfPlayerExists = await MongoService.findOne(this.GameNumberOfPlayer, {
                query: { _id: gameNumberOfPlayerId, isDefault: false },
                select: 'numberOfPlayer'
            });

            if (!isGameNumberOfPlayerExists) {
                request.statusCode = STATUS_CODE.BAD_REQUEST;
                throw new Error(
                    ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'number of player')
                );
            }
            const gameId = isGameNumberOfPlayerExists.gameId;
            const isNumberOfPlayerExists = await MongoService.findOne(this.GameNumberOfPlayer, {
                query: { _id: { $ne: gameNumberOfPlayerId }, gameId: gameId, numberOfPlayer: numberOfPlayer },
                select: 'numberOfPlayer'
            });

            if (isNumberOfPlayerExists) {
                request.statusCode = STATUS_CODE.BAD_REQUEST;
                throw new Error(
                    ERROR_MESSAGES.COMMON.ALREADY_EXISTS.replace(':attribute', 'number of player')
                );
            }

            if (isDefaultBoolean) {
                const isDefaultNumberOfPlayerExists = await MongoService.findOne(this.GameNumberOfPlayer, {
                    query: { _id: { $ne: gameNumberOfPlayerId }, gameId: gameId, isDefault: true },
                    select: 'numberOfPlayer'
                });

                if (isDefaultNumberOfPlayerExists) {
                    request.statusCode = STATUS_CODE.BAD_REQUEST;
                    throw new Error(
                        ERROR_MESSAGES.COMMON.ALREADY_EXISTS.replace(':attribute', 'default number of player')
                    );
                }
            }

            const updateNumberOfPlayer = await MongoService.findOneAndUpdate(this.GameNumberOfPlayer, {
                query: { _id: gameNumberOfPlayerId, isDefault: false },
                updateData: {
                    $set: {
                        numberOfPlayer: numberOfPlayer,
                        updateAdminId: adminId
                    }
                }
            })

            return successMiddleware(
                {
                    message: SUCCESS_MESSAGES.COMMON.UPDATE_SUCCESS.replace(':attribute', 'Number of player'),
                    data: updateNumberOfPlayer
                },
                request,
                response,
                next
            );

        } catch (error) {
            Logger.error(`There was an issue into updating a number of player.: ${error}`);
            return next(error);
        }
    };

    private deleteGameNumberOfPlayer = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const { gameNumberOfPlayerId } = request.body;

            const numberOfPlayer = await MongoService.findOne(this.GameNumberOfPlayer, {
                query: { _id: gameNumberOfPlayerId, isDefault: false }
            });

            if (!numberOfPlayer) {
                response.statusCode = STATUS_CODE.NOT_FOUND;
                throw new Error(ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'number of player'));
            } else {

                const deleteResult = await MongoService.deleteOne(this.GameNumberOfPlayer, {
                    query: { _id: gameNumberOfPlayerId, isDefault: false }
                });

                return successMiddleware(
                    {
                        message: SUCCESS_MESSAGES.COMMON.DELETE_SUCCESS.replace(':attribute', 'Number of player'),
                        data: numberOfPlayer
                    },
                    request,
                    response,
                    next
                );
            }
        } catch (error) {
            Logger.error(`There was an issue into deleting a number of player.: ${error}`);
            return next(error);
        }
    };

    private activeDactiveGameNumberOfPlayer = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const request = req as RequestWithUser;
            const adminId = request.user._id;

            const { gameNumberOfPlayerId, isActive } = req.body;
            const isActiveBoolean = Boolean(JSON.parse(isActive));
            const isGameNumberOfPlayerExits = await MongoService.findOne(this.GameNumberOfPlayer, {
                query: { _id: gameNumberOfPlayerId, isDefault: false },
                select: 'isActive'
            });

            if (!isGameNumberOfPlayerExits) {
                res.statusCode = STATUS_CODE.BAD_REQUEST;
                throw new Error(
                    ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'game number of player')
                );
            }

            const gameNumberOfPlayer = await MongoService.findOneAndUpdate(this.GameNumberOfPlayer, {
                query: { _id: gameNumberOfPlayerId, isDefault: false },
                updateData: { $set: { isActive: isActiveBoolean, updateAdminId: adminId } }
            });

            return successMiddleware(
                {
                    message: SUCCESS_MESSAGES.COMMON.UPDATE_SUCCESS.replace(':attribute', 'Game number of player'),
                    data: gameNumberOfPlayer
                },
                req,
                res,
                next
            );
        } catch (error) {
            Logger.error(`There was an issue into active/deactive game number of player.: ${error}`);
            return next(error);
        }
    };

    private swapPosiiton = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { gameNumberOfPlayerId, gameId, oldPosition, newPosition } = req.body

            const position = await MongoService.findOne(this.GameNumberOfPlayer, {
                query: { _id: gameNumberOfPlayerId, gameId: gameId, position: oldPosition },
                select: 'position'
            })

            const isOldPositionExits = await MongoService.findOne(this.GameNumberOfPlayer, {
                query: { gameId: gameId, position: oldPosition },
                select: 'position'
            })

            const isNewPositionExits = await MongoService.findOne(this.GameNumberOfPlayer, {
                query: { gameId: gameId, position: newPosition },
                select: 'position'
            })

            if (!position) {
                res.statusCode = STATUS_CODE.BAD_REQUEST;
                throw new Error(
                    ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'game number of player')
                );
            } else if (!isOldPositionExits) {
                res.statusCode = STATUS_CODE.BAD_REQUEST;
                throw new Error(
                    ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'oldPosition')
                );
            } else if (!isNewPositionExits) {
                res.statusCode = STATUS_CODE.BAD_REQUEST;
                throw new Error(
                    ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'newPosition')
                );
            } else {
                if (oldPosition == newPosition) {
                    return successMiddleware(
                        {
                            message: SUCCESS_MESSAGES.COMMON.UPDATE_SUCCESS.replace(
                                ':attribute',
                                'Game number of player position'
                            ),
                            data: {}
                        },
                        req,
                        res,
                        next
                    );
                }

                let gameNumberOfPlayerPosition
                if (oldPosition < newPosition) {
                    gameNumberOfPlayerPosition = await MongoService.findOneAndUpdate(this.GameNumberOfPlayer, {
                        query: { _id: gameNumberOfPlayerId, gameId: gameId },
                        updateData: {
                            $set: {
                                position: newPosition
                            }
                        }
                    })
                    const btPostion = await MongoService.updateMany(this.GameNumberOfPlayer, {
                        query: {
                            _id: { $ne: gameNumberOfPlayerId },
                            gameId: gameId,
                            position: { $gte: oldPosition, $lte: newPosition },
                        },
                        updateData: {
                            $inc: { position: -1 }
                        }
                    })
                } else {
                    gameNumberOfPlayerPosition = await MongoService.findOneAndUpdate(this.GameNumberOfPlayer, {
                        query: { _id: gameNumberOfPlayerId, gameId: gameId },
                        updateData: {
                            $set: {
                                position: newPosition
                            }
                        }
                    })
                    const btPostion = await MongoService.updateMany(this.GameNumberOfPlayer, {
                        query: {
                            _id: { $ne: gameNumberOfPlayerId },
                            gameId: gameId,
                            position: { $gte: newPosition, $lte: oldPosition }
                        },
                        updateData: {
                            $inc: { position: 1 }
                        }
                    })
                }
                return successMiddleware(
                    {
                        message: SUCCESS_MESSAGES.COMMON.UPDATE_SUCCESS.replace(
                            ':attribute',
                            'Game number of player position'
                        ),
                        data: { gameNumberOfPlayerPosition }
                    },
                    req,
                    res,
                    next
                );
            }

        } catch (error) {
            Logger.error(`There was an issue into swap position of game number of player: ${error}`);
            return next(error);
        }
    }
}

export default GameNumberOfPlayerController