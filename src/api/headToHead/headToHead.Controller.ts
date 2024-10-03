import { Router, Request, Response, NextFunction, request } from 'express';
import Controller from '../../interface/controller.interface';
import {
  COMMON_CONSTANT,
  ERROR_MESSAGES,
  PERMISSION,
  ROUTES,
  STATUS_CODE,
  SUCCESS_MESSAGES,
  TOURNAMENT_CONSTANT,
  USER_CONSTANT
} from '../../constant';
import headToHeadValidation from './headToHead.Validation';
import HeadToHeadModel from './headToHead.Model';
import lobbyTypeModel from '../lobbyType/lobbyType.Model';
import authMiddleware from '../../middleware/auth.middleware';
import roleMiddleware from '../../middleware/role.middleware';
import Logger from '../../logger';
import RequestWithUser from '../../interface/requestWithUser.interface';
import {
  CreateHeadToHeads,
  GetHeadToHeads,
  UpdateHeadToHead
} from './headToHead.Interface';
import { MongoService } from '../../utils';
import UserModel from '../user/user.model';
import GameModel from '../game/game.model';
import GameNumberOfPlayerModel from '../gameNumberOfPlayer/gameNumberOfPlayer.model';
import GameModeModel from '../gameMode/gameMode.model';
import { successMiddleware } from '../../middleware/responseAPI.middleware';
import moment from 'moment';
import { Pagination } from '../../utils/Pagination';
import { exportFileFunction } from '../../utils/exportFileFunction';
import PlayedGamesModel from '../playedGames/playedGames.model';
import { GameMode } from '../gameMode/gameMode.interface';
import UsersGameRunningStatusModel from '../usersGameRunningStatus/usersGameRunningStatus.model';

class HeadToHeadController implements Controller {
  public path = `/${ROUTES.HEAD_TO_HEAD}`;
  public router = Router();
  private validation = new headToHeadValidation();
  private eventTypeHeadToHead = TOURNAMENT_CONSTANT.EVENT_TYPE.headToHead;
  private HeadToHeadModel = HeadToHeadModel;
  private LobbyTypeModel = lobbyTypeModel;
  private GameModeModel = GameModeModel;

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      authMiddleware,
      roleMiddleware(
        [USER_CONSTANT.ROLES.admin, USER_CONSTANT.ROLES.publisher],
        PERMISSION.LOBBY_EDITOR
      ),
      this.validation.addHeadToHeadValidation(),
      this.addHeadToHead
    );

    this.router.post(
      `${this.path}/getHeadToHeads`,
      authMiddleware,
      roleMiddleware(
        [USER_CONSTANT.ROLES.admin, USER_CONSTANT.ROLES.publisher],
        PERMISSION.LOBBY_VIEWER
      ),
      this.validation.getHeadToHeadsValidation(),
      this.getHeadToHeads
    );

    this.router.put(
      `${this.path}`,
      authMiddleware,
      roleMiddleware(
        [USER_CONSTANT.ROLES.admin, USER_CONSTANT.ROLES.publisher],
        PERMISSION.LOBBY_EDITOR
      ),
      this.validation.updateHeadToHeadValidation(),
      this.updateHeadToHead
    );

    this.router.delete(
      `${this.path}`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.LOBBY_EDITOR),
      this.validation.deleteHeadToHeadValidation(),
      this.deleteHeadToHead
    );

    this.router.post(
      `${this.path}/activeDeactive`,
      authMiddleware,
      roleMiddleware(
        [USER_CONSTANT.ROLES.admin, USER_CONSTANT.ROLES.publisher],
        PERMISSION.LOBBY_EDITOR
      ),
      this.validation.activeDeactiveHeadToHeadValidation(),
      this.activeDeactiveHeadToHead
    );
  }

  private addHeadToHead = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const req = request as RequestWithUser;
      console.log('request.body :>> ', request.body);
      const {
        // tournamentName,
        // description,
        gameId,
        isUseBot,
        // lobbyType,
        noOfPlayer,
        isDummyPlayer
      } = request.body;

      const tournamentName = "tournamentName";
      const description = "description";
      const lobbyType = "642c1cfa8f225de3a579b2f6";


      let {
        gameModeId,
        publisherId,
        maxPlayer,
        minPlayer,
        entryfee,
        winningPrice,
        isCash,
        isAutoSplit
      } = request.body;

      const isDummyPlayerBoolean = Boolean(JSON.parse(isDummyPlayer));

      isCash = Boolean(JSON.parse(isCash));
      isAutoSplit = Boolean(JSON.parse(isAutoSplit));

      let createData: CreateHeadToHeads = {};
      let adminId;
      if (req.user.role == USER_CONSTANT.ROLES.publisher) {
        publisherId = req.user._id;
      } else {
        adminId = req.user._id;
      }
      // check is publisher exists or not
      const publisher = await MongoService.findOne(UserModel, {
        query: { _id: publisherId },
        select: 'isBlock'
      });
      console.log('publisher :>> ', publisher);

      if (!publisher) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'publisher')
        );
      }
      // check is game exists or not
      const isGameExists = await MongoService.findOne(GameModel, {
        query: { _id: gameId, publisherId: publisherId },
        select: 'gameName isGameModeOption isNoOfPlayer'
      });

      // Check is tournamentName already exists or not
      const isHeadToHeadNameExists = await MongoService.findOne(
        this.HeadToHeadModel,
        {
          query: {
            gameId: gameId,
            eventType: this.eventTypeHeadToHead,
            entryfee: entryfee,
            maxPlayer: maxPlayer,
            gameModeId : gameModeId
          },
          populate: { path: 'gameId', select: 'gameName' },
          select: 'entryfee maxPlayer gameId'
        } );

      if (!isGameExists) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'game')
        );
      }

      const isNoOfPlayer = isGameExists.isNoOfPlayer;
      const isNoOfPlayerBoolean = Boolean(JSON.parse(isNoOfPlayer));

      if (isNoOfPlayerBoolean) {
        if (!noOfPlayer) {
          response.statusCode = STATUS_CODE.BAD_REQUEST;
          throw new Error(
            ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'noOfPlayer')
          );
        }

        if (!minPlayer) {
          response.statusCode = STATUS_CODE.BAD_REQUEST;
          throw new Error(
            ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'minPlayer')
          );
        }

        if (minPlayer > noOfPlayer) {
          response.statusCode = STATUS_CODE.BAD_REQUEST;
          throw new Error(
            ERROR_MESSAGES.COMMON.MAXIMUM.replace(
              ':attribute',
              'minPlayer'
            ).replace(':value', 'noOfPlayer')
          );
        }
        createData.noOfPlayer = noOfPlayer;
      } else {
        const gameNumberOfPlayer = await MongoService.findOne(
          GameNumberOfPlayerModel,
          {
            query: { gameId: gameId, isDefault: true }
          }
        );
        createData.noOfPlayer =
          gameNumberOfPlayer && gameNumberOfPlayer.numberOfPlayer
            ? gameNumberOfPlayer.numberOfPlayer
            : 0;
        minPlayer =
          gameNumberOfPlayer && gameNumberOfPlayer.numberOfPlayer
            ? gameNumberOfPlayer.numberOfPlayer
            : 0;
      }

      if (isHeadToHeadNameExists) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.ALREADY_EXISTS.replace(
            ':attribute',
            'lobby'
          )
        );
      }

      const isGameModeOption = Boolean(
        JSON.parse(isGameExists.isGameModeOption)
      );
      if (isGameModeOption) {
        // check is game mode exists on game
        if (!gameModeId) {
          response.statusCode = STATUS_CODE.BAD_REQUEST;
          throw new Error(
            ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameModeId')
          );
        }

        const isGameModeExists = await MongoService.findOne(GameModeModel, {
          query: { _id: gameModeId, gameId: gameId },
          select: 'gameId gameModeName'
        });

        if (!isGameModeExists) {
          response.statusCode = STATUS_CODE.BAD_REQUEST;
          throw new Error(
            ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'gameMode')
          );
        }
      } else {
        gameModeId = null;
      }
      const eventType = this.eventTypeHeadToHead;

      // check lobby type
      const isTypeHeadToHead = await MongoService.findOne(this.LobbyTypeModel, {
        query: { _id: lobbyType },
        select: 'type isPracticeMode'
      });

      if (!isTypeHeadToHead) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'lobbyType')
        );
      }
      let gameName;
      if (isGameExists && isGameExists.gameName) {
        gameName = isGameExists.gameName;
      }
      createData.entryfee = entryfee;
      createData.winningPrice = winningPrice;

      if (isTypeHeadToHead.isPracticeMode) {
        (createData.entryfee = 0), (createData.winningPrice = 0);
      }

      const isGameModeName: GameMode = await MongoService.findOne(
        this.GameModeModel,
        {
          query: { _id: gameModeId }
        }
      );
      Logger.info(
        `------------>> isGameModeName <<-------------- ${JSON.stringify(
          isGameModeName
        )}`
      );
      Logger.info(
        `------------>> isGameModeName.gameTypeName <<-------------- ${isGameModeName.gameTypeName}`
      );

      let GameType;
      if (isGameModeName.gameTypeName === 'POINT') {
        Logger.info(
          `------------>> isGameModeName.gameTypeName 1<<-------------- ${isGameModeName.gameTypeName}`
        );

        GameType = '';
      } else if (isGameModeName.gameTypeName === '101POOL') {
        Logger.info(
          `------------>> isGameModeName.gameTypeName 2<<-------------- ${isGameModeName.gameTypeName}`
        );

        GameType = '101';
      } else if (isGameModeName.gameTypeName === '201POOL') {
        Logger.info(
          `------------>> isGameModeName.gameTypeName 3<<-------------- ${isGameModeName.gameTypeName}`
        );

        GameType = '201';
      } else if (isGameModeName.gameTypeName === '61POOL') {
        Logger.info(
          `------------>> isGameModeName.gameTypeName 4<<-------------- ${isGameModeName.gameTypeName}`
        );

        GameType = '61';
      } else if (isGameModeName.gameTypeName === '2DEALS') {
        Logger.info(
          `------------>> isGameModeName.gameTypeName 5<<-------------- ${isGameModeName.gameTypeName}`
        );

        GameType = '2';
      } else if (isGameModeName.gameTypeName === '3DEALS') {
        Logger.info(
          `------------>> isGameModeName.gameTypeName 6<<-------------- ${isGameModeName.gameTypeName}`
        );

        GameType = '3';
      }

      Logger.info(`------------>> GameType <<-------------- ${GameType}`);

      createData.gameType = GameType;
      createData.gameId = gameId;
      createData.publisherId = publisherId;
      createData.tournamentName = tournamentName;
      createData.description = description;
      createData.eventType = eventType;
      createData.lobbyType = lobbyType;
      createData.entryfee = entryfee;
      createData.isGameModeOption = isGameModeOption;
      createData.gameModeId = gameModeId;
      createData.isUseBot = isUseBot;
      createData.isActive = TOURNAMENT_CONSTANT.DEFAULT_ACTIVE_STATUS;
      createData.minPlayer = minPlayer;
      createData.maxPlayer = maxPlayer;
      createData.isDummyPlayer = isDummyPlayerBoolean;
      createData.isCash = isCash;
      createData.isAutoSplit = isAutoSplit;
      createData.createAdminId = adminId ? adminId : publisherId;
      createData.updateAdminId = adminId ? adminId : publisherId;

      const headToHead = await MongoService.create(this.HeadToHeadModel, {
        insert: createData
      });

      Logger.info(`------------>> headToHead <<-------------- ${headToHead}`);

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.CREATE_SUCCESS.replace(
            ':attribute',
            'Lobby'
          ),
          data: headToHead
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(`There was an issue into creating a lobby.: ${error}`);
      return next(error);
    }
  };

  private getHeadToHeads = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { csvDownload, exportFile } = request.body;
      let { startDate, endDate, gameId } = request.body;
      const {
        searchText,
        start,
        limit,
        gameModeId,
        isGameModeOption,
        noOfPlayer,
        isCash
      } = request.body;
      const pageStart = start ? start : 0;
      const pageLimit = limit ? limit : 10;

      const isGameIdExists = await MongoService.findOne(GameModel, {
        query: { _id: gameId }
      });

      if (!isGameIdExists) {
        request.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'game')
        );
      }

      let query: GetHeadToHeads = {
        eventType: TOURNAMENT_CONSTANT.EVENT_TYPE.headToHead
      };

      if (gameId) {
        query = {
          ...query,
          gameId: gameId
        };
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
              $lt: new Date(endDate)
            }
          };
        } else {
          response.statusCode = STATUS_CODE.NOT_FOUND;
          throw new Error(
            ERROR_MESSAGES.COMMON.GRATER.replace(
              ':attribute',
              'endDate'
            ).replace(':another', 'startDate')
          );
        }
      }

      if (searchText) {
        const regex = { $regex: new RegExp('^' + searchText + '', 'i') };
        query = {
          ...query,
          entryfee: Number(searchText)
          // $or: [
          //   {
          //     entryfee: regex
          //   },
          //   {
          //     winningPrice: regex
          //   }
          // ]
        };
      }

      if (gameModeId) {
        query = {
          ...query,
          gameModeId: gameModeId
        };
      }

      if (noOfPlayer) {
        query = {
          ...query,
          noOfPlayer: noOfPlayer
        };
      }

      if (isCash) {
        query = {
          ...query,
          isCash: isCash
        };
      }

      if (isGameModeOption != undefined) {
        const isGameModeOptionBoolean = Boolean(JSON.parse(isGameModeOption));
        query = {
          ...query,
          isGameModeOption: isGameModeOptionBoolean
        };
      }

      const headToHeads = await Pagination(this.HeadToHeadModel, {
        query,
        populate: [
          { path: 'gameModeId', select: 'gameModeName' },
          { path: 'lobbyType', select: 'lobbyType' }
        ],
        sort: {
          "entryfee": 1
        },
        offset: pageStart,
        limit: pageLimit
      });

      const headToHeadsData: any = headToHeads.docs;

      headToHeads.docs = headToHeadsData;

      if (!headToHeads) {
        response.statusCode = STATUS_CODE.NOT_FOUND;
        throw new Error(ERROR_MESSAGES.NOT_FOUND);
      }

      if (exportFile) {
        let exportResponseData = [];
        for (let i = 0; i < headToHeadsData.length; i++) {
          exportResponseData.push({
            'Sr.No.': i + 1,
            'Lobby ID': `${headToHeadsData[i]._id}`
              ? `${headToHeadsData[i]._id}`
              : '',
            // 'Lobby Type': headToHeadsData[i].lobbyType.lobbyType
            //   ? headToHeadsData[i].lobbyType.lobbyType
            //   : '',
            'Mode': headToHeadsData[i]?.gameModeId?.gameModeName ?? '',
            'IsCash': headToHeadsData[i]?.isCash
              ? headToHeadsData[i]?.isCash
              : false,
            'Min Players': headToHeadsData[i].minPlayer
              ? headToHeadsData[i].minPlayer
              : '',
            'Max Players': headToHeadsData[i].maxPlayer
              ? headToHeadsData[i].maxPlayer
              : '',
            'Entry Fee': headToHeadsData[i].entryfee
              ? headToHeadsData[i].entryfee
              : '',
            'Winning Prize':
              headToHeadsData[i]?.gameModeId?.gameModeName === 'Points'
                ? ''
                : headToHeadsData[i]?.winningPrice || '',
            // 'Name': headToHeadsData[i].tournamentName
            //   ? headToHeadsData[i].tournamentName
            //   : '',
            // 'Description': headToHeadsData[i].description
            //   ? headToHeadsData[i].description
            //   : '',
            'Enabled/Disabled': headToHeadsData[i].isActive
              ? headToHeadsData[i].isActive
              : false,
            'Create Date & Time': headToHeadsData[i].createdAt
              ? moment
                  .utc(headToHeadsData[i].createdAt)
                  .add(5, 'hours')
                  .add(30, 'minutes')
                  .format('MMM-DD-YYYY hh:mm A')
              : ''
          });
        }

        await exportFileFunction(
          csvDownload,
          'LobbyList',
          exportResponseData,
          response,
          request,
          next
        );
      } else {
        return successMiddleware(
          {
            message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(
              ':attribute',
              'Lobby'
            ),
            data: headToHeads
          },
          request,
          response,
          next
        );
      }
    } catch (error) {
      Logger.error(`There was an issue into fetching lobbies.: ${error}`);
      return next(error);
    }
  };

  private updateHeadToHead = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const req = request as RequestWithUser;
      const {
        // tournamentName,
        // description,
        headToHeadId,
        gameId,
        isUseBot,
        // lobbyType,
        noOfPlayer,
        isDummyPlayer
      } = request.body;

      const tournamentName = "tournamentName";
      const description = "description";
      const lobbyType = "642c1cfa8f225de3a579b2f6";

      let {
        gameModeId,
        maxPlayer,
        minPlayer,
        publisherId,
        winningPrice,
        entryfee,
        isCash
      } = request.body;
      const isDummyPlayerBoolean = Boolean(JSON.parse(isDummyPlayer));
      isCash = Boolean(JSON.parse(isCash));

      let updateData: UpdateHeadToHead = {};
      let adminId;

      if (req.user.role == USER_CONSTANT.ROLES.publisher) {
        publisherId = req.user._id;
      } else {
        adminId = req.user._id;
      }

      // Check is HeadToHeadExists exists or not
      const isHeadToHeadExists = await MongoService.findOne(
        this.HeadToHeadModel,
        {
          query: {
            _id: headToHeadId,
            gameId: gameId,
            publisherId: publisherId,
            eventType: this.eventTypeHeadToHead
          },
          populate: { path: 'gameId', select: 'gameName' },
          select: 'tournamentName gameId'
        }
      );

      if (!isHeadToHeadExists) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'lobby')
        );
      } else {
        // Check is tournamentName already exists or not
        const isHeadToHeadNameExists = await MongoService.findOne(
          this.HeadToHeadModel,
          {
            query: {
              _id: { $ne: headToHeadId },
              gameId: gameId,
              eventType: this.eventTypeHeadToHead,
              // tournamentName: {
              //   $regex: new RegExp(`^${tournamentName}$`),
              //   $options: 'i'
              // }
              entryfee: entryfee,
              maxPlayer: maxPlayer,
              gameModeId : gameModeId
            },
            select: 'entryfee maxPlayer gameModeId'
          }
        );

        if (isHeadToHeadNameExists) {
          response.statusCode = STATUS_CODE.BAD_REQUEST;
          throw new Error(
            ERROR_MESSAGES.COMMON.ALREADY_EXISTS.replace(
              ':attribute',
              'lobby'
            )
          );
        }

        // check is publisher exists or not
        const publisher = await MongoService.findOne(UserModel, {
          query: { _id: publisherId },
          select: 'isBlock'
        });

        if (!publisher) {
          response.statusCode = STATUS_CODE.BAD_REQUEST;
          throw new Error(
            ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'publisher')
          );
        }

        // check is game exists or not
        const isGameExists = await MongoService.findOne(GameModel, {
          query: { _id: gameId, publisherId: publisherId },
          select: 'gameName isGameModeOption isNoOfPlayer'
        });

        if (!isGameExists) {
          response.statusCode = STATUS_CODE.BAD_REQUEST;
          throw new Error(
            ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'game')
          );
        }

        const isNoOfPlayer = isGameExists.isNoOfPlayer;
        const isNoOfPlayerBoolean = Boolean(JSON.parse(isNoOfPlayer));

        if (isNoOfPlayerBoolean) {
          if (!noOfPlayer) {
            response.statusCode = STATUS_CODE.BAD_REQUEST;
            throw new Error(
              ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'noOfPlayer')
            );
          }

          if (!minPlayer) {
            response.statusCode = STATUS_CODE.BAD_REQUEST;
            throw new Error(
              ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'minPlayer')
            );
          }

          if (minPlayer > noOfPlayer) {
            response.statusCode = STATUS_CODE.BAD_REQUEST;
            throw new Error(
              ERROR_MESSAGES.COMMON.MAXIMUM.replace(
                ':attribute',
                'minPlayer'
              ).replace(':value', 'noOfPlayer')
            );
          }
          updateData.noOfPlayer = noOfPlayer;
        }

        const isGameModeOption = Boolean(
          JSON.parse(isGameExists.isGameModeOption)
        );
        if (isGameModeOption) {
          // check is game mode exists on game
          if (!gameModeId) {
            response.statusCode = STATUS_CODE.BAD_REQUEST;
            throw new Error(
              ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameModeId')
            );
          }

          const isGameModeExists = await MongoService.findOne(GameModeModel, {
            query: { _id: gameModeId, gameId: gameId },
            select: 'gameId gameModeName'
          });

          if (!isGameModeExists) {
            response.statusCode = STATUS_CODE.BAD_REQUEST;
            throw new Error(
              ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'gameMode')
            );
          }
        } else {
          gameModeId = null;
        }

        // check lobby type
        const isTypeHeadToHead = await MongoService.findOne(
          this.LobbyTypeModel,
          {
            query: { _id: lobbyType },
            select: 'type isPracticeMode'
          }
        );

        if (!isTypeHeadToHead) {
          response.statusCode = STATUS_CODE.BAD_REQUEST;
          throw new Error(
            ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'lobbyType')
          );
        }

        const isTournamentUse = await MongoService.findOne(UsersGameRunningStatusModel, {
          query: { tournamentId: headToHeadId },
          select: 'tournamentId'
        })

        if (isTournamentUse) {
          response.statusCode = STATUS_CODE.BAD_REQUEST;
          throw new Error(ERROR_MESSAGES.COMMON.ALREADY_IN_USE.replace(':attribute', 'lobby'));
        }

        updateData.entryfee = entryfee;
        updateData.winningPrice = winningPrice;

        if (isTypeHeadToHead.isPracticeMode) {
          (updateData.entryfee = 0), (updateData.winningPrice = 0);
        }

        updateData.tournamentName = tournamentName;
        updateData.description = description;
        updateData.isGameModeOption = isGameModeOption;
        updateData.isUseBot = isUseBot;
        updateData.lobbyType = lobbyType;
        updateData.minPlayer = minPlayer;
        updateData.maxPlayer = maxPlayer;
        updateData.gameModeId = gameModeId;
        updateData.isDummyPlayer = isDummyPlayerBoolean;
        updateData.isCash = isCash;
        updateData.updateAdminId = adminId ? adminId : publisherId;

        // update hed to head details
        const headToHead = await MongoService.findOneAndUpdate(
          this.HeadToHeadModel,
          {
            query: {
              _id: headToHeadId,
              gameId: gameId,
              publisherId: publisherId,
              eventType: this.eventTypeHeadToHead
            },
            updateData: { $set: updateData }
          }
        );

        return successMiddleware(
          {
            message: SUCCESS_MESSAGES.COMMON.UPDATE_SUCCESS.replace(
              ':attribute',
              'Lobby'
            ),
            data: headToHead
          },
          request,
          response,
          next
        );
      }
    } catch (error) {
      Logger.error(`There was an issue into updating a lobby.: ${error}`);
      return next(error);
    }
  };

  private deleteHeadToHead = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { headToHeadId } = request.body;

      // check headToHead exists or not
      const headToHead = await MongoService.findOne(this.HeadToHeadModel, {
        query: { _id: headToHeadId, eventType: this.eventTypeHeadToHead }
      });

      if (!headToHead) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'lobby')
        );
      } else {
        const isTournamentUse = await MongoService.findOne(UsersGameRunningStatusModel, {
          query: { tournamentId: headToHeadId },
          select: 'tournamentId'
        });

        if (isTournamentUse) {
          response.statusCode = STATUS_CODE.BAD_REQUEST;
          throw new Error(
            ERROR_MESSAGES.COMMON.ALREADY_IN_USE.replace(':attribute', 'lobby')
          );
        }

        const deleteResult = await MongoService.deleteOne(
          this.HeadToHeadModel,
          {
            query: { _id: headToHeadId }
          }
        );

        return successMiddleware(
          {
            message: SUCCESS_MESSAGES.COMMON.DELETE_SUCCESS.replace(
              ':attribute',
              'Lobby'
            ),
            data: headToHead
          },
          request,
          response,
          next
        );
      }
    } catch (error) {
      Logger.error(`There was an issue into deleting a lobby.: ${error}`);
      return next(error);
    }
  };

  private activeDeactiveHeadToHead = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { headToHeadId, isActive } = request.body;
      const isActiveBoolean = Boolean(JSON.parse(isActive));

      const headToHead = await MongoService.findOne(this.HeadToHeadModel, {
        query: {
          _id: headToHeadId,
          eventType: this.eventTypeHeadToHead
        }
      });

      if (!headToHead) {
        response.statusCode = STATUS_CODE.NOT_FOUND;
        throw new Error(
          ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'lobby')
        );
      }

      // update hed to head details
      const updatedHeadToHead = await MongoService.findOneAndUpdate(
        this.HeadToHeadModel,
        {
          query: { _id: headToHeadId, eventType: this.eventTypeHeadToHead },
          updateData: { $set: { isActive: isActiveBoolean } }
        }
      );

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.UPDATE_SUCCESS.replace(
            ':attribute',
            'Lobby'
          ),
          data: updatedHeadToHead
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(`There was an issue into active/deactive lobby.: ${error}`);
      return next(error);
    }
  };
}

export default HeadToHeadController;
