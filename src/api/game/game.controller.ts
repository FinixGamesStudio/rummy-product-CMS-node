import { Router, Request, Response, NextFunction } from 'express';
import Controller from '../../interface/controller.interface';
import GameModel from './game.model';
import authMiddleware from '../../middleware/auth.middleware';
import Logger from '../../logger/index';
import { successMiddleware } from '../../middleware/responseAPI.middleware';
import { MongoService, Pagination } from '../../utils';
import RequestWithUser from '../../interface/requestWithUser.interface';
import roleMiddleware from '../../middleware/role.middleware';
import {
  ROUTES,
  SUCCESS_MESSAGES,
  USER_CONSTANT,
  STATUS_CODE,
  ERROR_MESSAGES
} from '../../constant';
import GameModeModel from '../gameMode/gameMode.model';
import GameValidation from './game.validation';
import lobbyTypeModel from '../../api/lobbyType/lobbyType.Model';
import GameNumberOfPlayerModel from '../gameNumberOfPlayer/gameNumberOfPlayer.model';

class GameController implements Controller {
  public path = `/${ROUTES.GAME}`;
  public router = Router();
  private GameModel = GameModel;
  private validation = new GameValidation();
  private GameModeModel = GameModeModel;
  private LobbyTypeModel = lobbyTypeModel;
  private GameNumberOfPlayerModel = GameNumberOfPlayerModel;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      authMiddleware,
      roleMiddleware(
        [USER_CONSTANT.ROLES.publisher, USER_CONSTANT.ROLES.admin]
      ),
      this.createGame
    );

    this.router.post(
      `${this.path}/getGameDetails`,
      authMiddleware,
      roleMiddleware(
        [USER_CONSTANT.ROLES.admin]
      ),
      this.validation.getGameDetailsValidation(),
      this.getGameDetails
    );
  }

  private createGame = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const req = request as RequestWithUser;
      const userId = req.user._id;

      const game = await MongoService.create(this.GameModel, {
        insert: {
          gameName : "rummy",
          description : "rummy description",
          publisherId: userId,
        }
      });

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.CREATE_SUCCESS.replace(
            ':attribute',
            'The game'
          ),
          data: game
        },
        request,
        response,
        next
      );

    } catch (error) {
      Logger.error(`There was an issue into creating a game: ${error}`);
      return next(error);
    }
  };

  private getGameDetails = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { gameId } = request.body;

      const game = await MongoService.findOne(this.GameModel, {
        query: { _id: gameId },
        populate: 'publisherId'
      });
      // console.log('game :>> ', game);
      if (!game) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'game'));
      }

      const gameModes = await MongoService.find(this.GameModeModel, {
        query: { gameId: gameId },
        select: 'gameModeName gameModeIcon gameTypeName'
      });
      game.gameModes = gameModes;

      const lobbyType = await MongoService.find(this.LobbyTypeModel, {})
      game.lobbyType = lobbyType;

      const gameNumberOfPlayer = await MongoService.find(this.GameNumberOfPlayerModel, {
        query: { gameId: gameId, isActive: true },
        select: 'gameId numberOfPlayer isDefault'
      })
      game.numberOfPlayer = gameNumberOfPlayer;

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(
            ':attribute',
            'Game details'
          ),
          data: game
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(`There was an issue into fetching game details.: ${error}`);
      return next(error);
    }
  };

}

export default GameController;