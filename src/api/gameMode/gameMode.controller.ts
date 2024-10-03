import { Router, Request, Response, NextFunction } from 'express';
import Controller from '../../interface/controller.interface';
import authMiddleware from '../../middleware/auth.middleware';
import Logger from '../../logger/index';
import { successMiddleware } from '../../middleware/responseAPI.middleware';
import RequestWithUser from '../../interface/requestWithUser.interface';
import roleMiddleware from '../../middleware/role.middleware';
import GameModeValidation from './gameMode.validation';
import multer from 'multer';
import { validateFile } from '../../utils/validationFunctions';
import { MongoService, Pagination } from '../../utils';
import { uploadToS3 } from '../../utils/s3';
import GameModel from '../game/game.model';
import GameModeModel from './gameMode.model';
// import TournamentModel from '../tournaments/tournament.model';

import {
  ROUTES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  STATUS_CODE,
  USER_CONSTANT,
  PERMISSION,
  GAME_MODE_CONSTANT
} from '../../constant';

const upload = multer({ storage: multer.memoryStorage() })

class GameModeController implements Controller {
  public path = `/${ROUTES.GAME_MODE}`;
  public router = Router();
  private validation = new GameModeValidation();
  private GameModeModel = GameModeModel;
  private GameModel = GameModel;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      authMiddleware,
      roleMiddleware(
        [USER_CONSTANT.ROLES.admin, USER_CONSTANT.ROLES.publisher]
      ),
      upload.single('gameModeIcon'),
      this.validation.addGameModeValidation(),
      this.addGameMode
    );

    this.router.put(
      `${this.path}`,
      authMiddleware,
      roleMiddleware(
        [USER_CONSTANT.ROLES.admin, USER_CONSTANT.ROLES.publisher]
      ),
      upload.single('gameModeIcon'),
      this.validation.updateGameModeValidation(),
      this.updateGameMode
    );

    this.router.delete(
      `${this.path}`,
      authMiddleware,
      roleMiddleware(
        [USER_CONSTANT.ROLES.admin, USER_CONSTANT.ROLES.publisher]
      ),
      this.validation.deleteGameModeValidation(),
      this.deleteGameMode
    );

    this.router.post(
      `${this.path}/getGameModes`,
      authMiddleware,
      roleMiddleware(
        [USER_CONSTANT.ROLES.admin, USER_CONSTANT.ROLES.publisher]
      ),
      this.validation.getGameModesValidation(),
      this.getGameModes
    );

    this.router.post(
      `${this.path}/swapPosition`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin]),
      this.validation.swapGameModePositionValidation(),
      this.swapPosition
    );
  }

  private addGameMode = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const req = request as RequestWithUser;
      const adminId = req.user._id;

      const { gameId, gameModeName } = request.body;
      let { isIconAdded } = request.body;
      isIconAdded = Boolean(JSON.parse(isIconAdded));

      let getGameQuery: any = {
        _id: gameId
      }

      if (req.user.role === USER_CONSTANT.ROLES.publisher) {
        const publisherId = req.user._id;

        getGameQuery = {
          ...getGameQuery,
          publisherId: publisherId
        }
      }

      // Check is game belongs to valid publisher or not
      const game = await MongoService.findOne(this.GameModel, {
        query: getGameQuery,
        select: 'isGameModeOption'
      });

      if (!game) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'game')
        );
      } else {
        // check game enabled isGameModeOption true
        const isGameModeOptionOn = Boolean(JSON.parse(game.isGameModeOption));

        if (!isGameModeOptionOn) {
          response.statusCode = STATUS_CODE.BAD_REQUEST;
          throw new Error(
            ERROR_MESSAGES.GAME_MODE_NOT_ON
          );
        }

        // check game mode already exists or not
        const isGameModeExists = await MongoService.findOne(this.GameModeModel, {
          query: { gameId, gameModeName: { $regex: new RegExp(`^${gameModeName}$`), $options: 'i' } },
          select: 'gameModeName'
        });

        if (isGameModeExists) {
          response.statusCode = STATUS_CODE.BAD_REQUEST;
          throw new Error(
            ERROR_MESSAGES.COMMON.ALREADY_EXISTS.replace(':attribute', 'game mode name')
          );
        }

        let gameModeIconUrl = '';

        if (isIconAdded) {
          const gameModeIcon = request.file;
          const allowedExtenstion = GAME_MODE_CONSTANT.GAME_MODE_ICON_EXT_ARRAY;
          const maxFileSizeMb = GAME_MODE_CONSTANT.GAME_MODE_ICON_FILE_SIZE;

          // validate gameModeIcon file
          await validateFile(response, gameModeIcon, 'gameModeIcon', allowedExtenstion, 'gameModeIcon', maxFileSizeMb);

          const uploadResult = await uploadToS3(gameModeIcon, 'GameModeIcons', false);

          if (uploadResult) {
            gameModeIconUrl = uploadResult.Location;
          } else {
            response.statusCode = STATUS_CODE.BAD_REQUEST;
            throw new Error(
              'There was an issue into uploding game mode icon on s3 server.'
            );
          }
        }

        // calculate position
        const maxPosition = await MongoService.find(this.GameModeModel, {
          query: { gameId: gameId },
          sort: {
            "position": -1
          } as any
        });

        const insertData = {
          gameId,
          gameModeName,
          gameModeIcon: gameModeIconUrl,
          position: (maxPosition[0] && maxPosition[0].position) ? maxPosition[0].position + 1 : 1,
          createAdminId: adminId,
          updateAdminId: adminId
        }

        const createdGameMode = await MongoService.create(this.GameModeModel, {
          insert: insertData
        });

        return successMiddleware(
          {
            message: SUCCESS_MESSAGES.COMMON.CREATE_SUCCESS.replace(':attribute', 'Game mode'),
            data: createdGameMode
          },
          request,
          response,
          next
        );
      }
    } catch (error) {
      Logger.error(`There was an issue into creating game mode.: ${error}`);
      return next(error);
    }
  };

  private updateGameMode = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const req = request as RequestWithUser;
      const adminId = req.user._id;

      const { gameId, gameModeName, gameModeId } = request.body;
      let { isIconUpdated, isIconDeleted } = request.body;
      isIconUpdated = Boolean(JSON.parse(isIconUpdated));
      isIconDeleted = Boolean(JSON.parse(isIconDeleted));

      let getGameQuery: any = {
        _id: gameId
      }

      if (req.user.role === USER_CONSTANT.ROLES.publisher) {
        const publisherId = req.user._id;

        getGameQuery = {
          ...getGameQuery,
          publisherId: publisherId
        }
      }

      // Check is game belongs to valid publisher or not
      const game = await MongoService.findOne(this.GameModel, {
        query: getGameQuery,
        select: 'isGameModeOption'
      });

      // Check is game mode exists belongs
      const isGameModeExists = await MongoService.findOne(this.GameModeModel, {
        query: { _id: gameModeId, gameId: gameId },
        select: 'gameModeName gameModeIcon ,gameTypeName'
      });


      if (!game) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'game')
        );
      } else if (!isGameModeExists) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'game mode')
        );
      } else {
        // check game enabled isGameModeOption true
        const isGameModeOptionOn = Boolean(JSON.parse(game.isGameModeOption));

        if (!isGameModeOptionOn) {
          response.statusCode = STATUS_CODE.BAD_REQUEST;
          throw new Error(
            ERROR_MESSAGES.GAME_MODE_NOT_ON
          );
        }

        // check game mode already exists or not
        const isGameModeNameExists = await MongoService.findOne(this.GameModeModel, {
          query: {
            _id: { $ne: gameModeId },
            gameId,
            gameModeName: { $regex: new RegExp(`^${gameModeName}$`), $options: 'i' }
          },
          select: 'gameModeName'
        });

        if (isGameModeNameExists) {
          response.statusCode = STATUS_CODE.BAD_REQUEST;
          throw new Error(
            ERROR_MESSAGES.COMMON.ALREADY_EXISTS.replace(':attribute', 'game mode name')
          );
        }

        let gameModeIconUrl = isGameModeExists.gameModeIcon;

        if (isIconUpdated) {
          const gameModeIcon = request.file;
          const allowedExtenstion = GAME_MODE_CONSTANT.GAME_MODE_ICON_EXT_ARRAY;
          const maxFileSizeMb = GAME_MODE_CONSTANT.GAME_MODE_ICON_FILE_SIZE;

          // validate gameModeIcon file
          await validateFile(response, gameModeIcon, 'gameModeIcon', allowedExtenstion, 'gameModeIcon', maxFileSizeMb);

          const uploadResult = await uploadToS3(gameModeIcon, 'GameModeIcons');

          if (uploadResult) {
            // Note : User has not access to deletefile. And permission also not given beacuse risk of delete bucket.
            // if(isGameModeExists.gameModeIcon) {
            //   const fileName = isGameModeExists.gameModeIcon;
            //   const awsHostUrl = COMMON_CONSTANT.AWS_HOST_URL + "/";
            //   const fileNameKey = fileName.replace(awsHostUrl, "");
            //   const deleteImageResult = await deleteFromS3(fileNameKey);
            // }


            gameModeIconUrl = uploadResult.Location;
          } else {
            response.statusCode = STATUS_CODE.BAD_REQUEST;
            throw new Error(
              'There was an issue into uploding game mode icon on s3 server into update game mode.'
            );
          }
        } else {
          if (isIconDeleted) {
            gameModeIconUrl = '';

            // Note : User has not access to deletefile. And permission also not given beacuse risk of delete bucket.
            // if(isGameModeExists.gameModeIcon) {
            //   const fileName = isGameModeExists.gameModeIcon;
            //   const awsHostUrl = COMMON_CONSTANT.AWS_HOST_URL + "/";
            //   const fileNameKey = fileName.replace(awsHostUrl, "");
            //   const deleteImageResult = await deleteFromS3(fileNameKey);
            // }
          }
        }

        const updateData = {
          gameModeName,
          gameModeIcon: gameModeIconUrl,
          updateAdminId: adminId
        };

        // update game mode details
        const updatedGameMode = await MongoService.findOneAndUpdate(this.GameModeModel, {
          query: { _id: gameModeId, gameId: gameId },
          updateData: { $set: updateData }
        });

        return successMiddleware(
          {
            message: SUCCESS_MESSAGES.COMMON.UPDATE_SUCCESS.replace(':attribute', 'Game mode'),
            data: updatedGameMode
          },
          request,
          response,
          next
        );
      }
    } catch (error) {
      Logger.error(`There was an issue into updating game mode.: ${error}`);
      return next(error);
    }
  };

  private deleteGameMode = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const req = request as RequestWithUser;
      const { gameId, gameModeId } = request.body;

      let getGameQuery: any = {
        _id: gameId
      }

      if (req.user.role === USER_CONSTANT.ROLES.publisher) {
        const publisherId = req.user._id;

        getGameQuery = {
          ...getGameQuery,
          publisherId: publisherId
        }
      }

      // Check is game belongs to valid publisher or not
      const game = await MongoService.findOne(this.GameModel, {
        query: getGameQuery, select: '_id'
      });

      // Check is game build exists or not
      const isGameModeExists = await MongoService.findOne(this.GameModeModel, {
        query: { _id: gameModeId, gameId: gameId }
      });

      if (!game) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'game')
        );
      } else if (!isGameModeExists) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'game mode')
        );
      } else {

        // check atlest two game mode
        const gameModes = await MongoService.find(this.GameModeModel, {
          query: { gameId: gameId },
          select: '_id'
        });

        const noOfGameModes = gameModes.length;

        if (!noOfGameModes || noOfGameModes <= GAME_MODE_CONSTANT.MIN_GAME_MODES) {
          response.statusCode = STATUS_CODE.BAD_REQUEST;
          throw new Error(
            ERROR_MESSAGES.MIN_GAME_MODES
          );
        }

        // Note : User has not access to deletefile. And permission also not given beacuse risk of delete bucket.
        // if(isGameModeExists.gameModeIcon) {
        //   const fileName = isGameModeExists.gameModeIcon;
        //   const awsHostUrl = COMMON_CONSTANT.AWS_HOST_URL + "/";
        //   const fileNameKey = fileName.replace(awsHostUrl, "");
        //   const deleteImageResult = await deleteFromS3(fileNameKey);
        // }

        // update position
        const position = await MongoService.updateMany(this.GameModeModel, {
          query: {
            "position": { $gt: isGameModeExists.position },
            gameId: gameId,
          },
          updateData: {
            $inc: { "position": -1 }
          }
        });

        const deleteResult = await MongoService.deleteOne(this.GameModeModel, {
          query: { _id: gameModeId, gameId: gameId }
        });

        return successMiddleware(
          {
            message: SUCCESS_MESSAGES.COMMON.DELETE_SUCCESS.replace(
              ':attribute',
              'Game Mode'
            ),
            data: isGameModeExists
          },
          request,
          response,
          next
        );
      }
    } catch (error) {
      Logger.error(`There was an issue into deleting a game mode.: ${error}`);
      return next(error);
    }
  };

  private getGameModes = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const req = request as RequestWithUser;
      const { gameId, start, limit } = request.body;

      let getGameQuery: any = {
        _id: gameId
      }

      if (req.user.role === USER_CONSTANT.ROLES.publisher) {
        const publisherId = req.user._id;

        getGameQuery = {
          ...getGameQuery,
          publisherId: publisherId
        }
      }

      // Check is game belongs to valid publisher or not
      const game = await MongoService.findOne(this.GameModel, {
        query: getGameQuery,
        select: '_id'
      });

      if (!game) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'game')
        );
      }

      const gameModes = await Pagination(this.GameModeModel, {
        query: { gameId: gameId },
        offset: start,
        limit,
        sort: { 'position': 1 },
      });

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(
            ':attribute',
            'Game modes'
          ),
          data: gameModes
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(`There was an issue into fetching game modes.: ${error}`);
      return next(error);
    }
  };

  private swapPosition = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = req as RequestWithUser;
      const adminId = request.user._id;

      const { gameModeId, oldPosition, newPosition } = req.body

      const position = await MongoService.findOne(this.GameModeModel, {
        query: { _id: gameModeId, position: oldPosition },
        select: 'position gameId'
      });

      if (!position) {
        res.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'game mode'));
      }

      const gameId = position.gameId;

      const isOldPositionExits = await MongoService.findOne(this.GameModeModel, {
        query: { position: oldPosition, gameId: gameId },
        select: 'position'
      })

      const isNewPositionExits = await MongoService.findOne(this.GameModeModel, {
        query: { position: newPosition, gameId: gameId },
        select: 'position'
      })

      if (!isOldPositionExits) {
        res.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'oldPosition'));
      } else if (!isNewPositionExits) {
        res.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'newPosition'));
      } else {
        if (oldPosition == newPosition) {
          return successMiddleware(
            {
              message: SUCCESS_MESSAGES.COMMON.UPDATE_SUCCESS.replace(
                ':attribute',
                'Game mode position'
              ),
              data: {}
            },
            req,
            res,
            next
          );
        }

        let gameModePosition;

        if (oldPosition < newPosition) {
          gameModePosition = await MongoService.findOneAndUpdate(this.GameModeModel, {
            query: { _id: gameModeId, gameId: gameId },
            updateData: {
              $set: {
                position: newPosition,
                updateAdminId: adminId
              }
            }
          });

          const btPostion = await MongoService.updateMany(this.GameModeModel, {
            query: {
              _id: { $ne: gameModeId },
              gameId: gameId,
              position: {
                $gte: oldPosition,
                $lte: newPosition
              }
            },
            updateData: {
              $inc: { position: -1 }
            }
          });
        } else {
          gameModePosition = await MongoService.findOneAndUpdate(this.GameModeModel, {
            query: { _id: gameModeId, gameId: gameId },
            updateData: {
              $set: {
                position: newPosition,
                updateAdminId: adminId
              }
            }
          });

          const btPostion = await MongoService.updateMany(this.GameModeModel, {
            query: {
              _id: { $ne: gameModeId },
              gameId: gameId,
              position: {
                $gte: newPosition,
                $lte: oldPosition
              }
            },
            updateData: {
              $inc: { position: 1 }
            }
          });
        }

        return successMiddleware(
          {
            message: SUCCESS_MESSAGES.COMMON.UPDATE_SUCCESS.replace(
              ':attribute',
              'Game mode position'
            ),
            data: { gameModePosition }
          },
          req,
          res,
          next
        );
      }
    } catch (error) {
      Logger.error(`There was an issue into swap position of game mode.: ${error}`);
      return next(error);
    }
  }

}

export default GameModeController;
