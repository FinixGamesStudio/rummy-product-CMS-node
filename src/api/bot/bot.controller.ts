import { Router, Request, Response, NextFunction } from 'express';
import Controller from '../../interface/controller.interface';
import authMiddleware from '../../middleware/auth.middleware';
import Logger from '../../logger/index';
import { successMiddleware } from '../../middleware/responseAPI.middleware';
import { MongoService, Pagination } from '../../utils';
import roleMiddleware from '../../middleware/role.middleware';
import BotBusyStatusModel from '../botBusyStatus/botBusyStatus.model';

import {
  ROUTES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  STATUS_CODE,
  USER_CONSTANT,
  PERMISSION,
  TOURNAMENT_CONSTANT
} from '../../constant';

import BotValidation from './bot.validation';
import { validateFile } from '../../utils/validationFunctions';
import multer from 'multer';
import { uploadToS3 } from '../../utils/s3';
import UserModel from '../user/user.model';
import { UpdateBotData } from './bot.interface';
import PlayedGamesModel from '../playedGames/playedGames.model';
import DataStoredInToken from '../../interface/dataStoredInToken';
import * as jwt from 'jsonwebtoken';
import getconfig from '../../config';
import RequestWithUser from '../../interface/requestWithUser.interface';
import { User } from '../user/user.interface';
import { Avatar } from '../avatar/avatar.interface';
import AvatarModel from '../avatar/avatar.model';
import { createRobot } from './common/createManualBot';
import HeadToHeadModel from '../headToHead/headToHead.Model';

const upload = multer({ storage: multer.memoryStorage() });
const { JWT_SECRET } = getconfig();

class BotController implements Controller {
  public path = `/${ROUTES.BOT}`;
  public router = Router();
  private validation = new BotValidation();
  private Avatar = AvatarModel;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.BOTS_EDITOR),
      upload.single('profileImage'),
      this.validation.createBotValidation(),
      this.createBot
    );

    this.router.put(
      `${this.path}`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.BOTS_EDITOR),
      upload.single('profileImage'),
      this.validation.updateBotValidation(),
      this.updateBot
    );

    this.router.post(
      `${this.path}/getBot`,
      // authMiddleware,
      // roleMiddleware([USER_CONSTANT.ROLES.user]),
      this.validation.getBotValidation(),
      this.getBot
    );

    this.router.post(
      `${this.path}/getBots`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.BOTS_VIEWER),
      this.validation.getBotsValidation(),
      this.getBots
    );

    this.router.delete(
      `${this.path}`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.BOTS_EDITOR),
      this.validation.deleteBotValidation(),
      this.deleteBot
    );
  }

  private createBot = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const request = req as RequestWithUser;
      const adminId = request.user._id
      const file = req.file;
      const maxSize = USER_CONSTANT.PROFILE_IMAGE_FILE_SIZE;
      const { fullName, coins } = req.body;
      // validate profile image file
      await validateFile(req, file, 'profileImage', USER_CONSTANT.PROFILE_IMAGE_EXT_ARRAY, 'profile image', maxSize);

      // check username exists or not
      const isUsernameExists = await MongoService.countDocuments(UserModel, {
        query: {
          fullName: { $regex: new RegExp(`^${fullName}$`), $options: 'i' }
        }
      });

      if (isUsernameExists) {
        res.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(ERROR_MESSAGES.COMMON.ALREADY_EXISTS.replace(':attribute', 'fullName'));
      }

      const uploadResult = await uploadToS3(file, 'ProfileImages');
      const BOT_DEFAULT = USER_CONSTANT.BOT_DEFAULT;
      const signUpBonus = USER_CONSTANT.SIGNUP_BONUS;
      const signUpCash = USER_CONSTANT.SIGNUP_CASH;

      //get free avatar
      const freeAvatar: Avatar = await MongoService.findOne(this.Avatar, {
        query: { isFree: true },
        select: 'avatarImage isFree coins'
      });

      if (uploadResult) {
        const bot = await MongoService.create(UserModel, {
          insert: {
            profileImage: uploadResult.Location,
            profileImageKey: uploadResult.key,
            role: USER_CONSTANT.ROLES.user,
            fullName,
            bonus: signUpBonus,
            cash: signUpCash,
            coins,
            initialCash: signUpBonus + signUpCash,
            isBot: true,
            winCash: BOT_DEFAULT.WIN_CASH,
            longitude: BOT_DEFAULT.LONGITUDE,
            latitude: BOT_DEFAULT.LATITUDE,
            createAdminId: adminId,
            updateAdminId: adminId,
            useAvatar: freeAvatar._id,
            purchaseAvatars: [freeAvatar._id]
          }
        });
        const token = this.createNeverExpireToken(bot._id);

        const updatedBot = await MongoService.findOneAndUpdate(UserModel, {
          query: { _id: bot._id },
          updateData: { token }
        });

        return successMiddleware(
          {
            message: SUCCESS_MESSAGES.COMMON.CREATE_SUCCESS.replace(':attribute', 'Bot'),
            data: bot
          },
          req,
          res,
          next
        );
      } else {
        res.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error('There was an issue into creating a bot.');
      }
    } catch (error) {
      Logger.error(`There was an issue into creating a bot.: ${error}`);
      return next(error);
    }
  };

  private getBot = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      // const req = request as RequestWithUser;
      // Logger.info('getBot :: req.user :>> ' + req.user);
      // const userId = req.user._id;
      const { tournamentId } = request.body;

      const tournament = await MongoService.findOne(HeadToHeadModel, {
        query: { _id: tournamentId, isActive: true },
        select: '_id entryfee gameId'
      });

      if (!tournament) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'tournament'));
      }

      const busyBots = await MongoService.find(BotBusyStatusModel, { select: 'botUserId' });
      const busyBotIds = busyBots.map(({ botUserId }: any) => (botUserId));

      // const realUser = await MongoService.findOne(UserModel, {
      //   query: { _id: userId }
      // }) as User;
      // Logger.info('getBot :: realUser :->> ' + realUser);

      // let query1 = [
      //   {
      //     $match: {
      //       _id: { $nin: busyBotIds },
      //       role: USER_CONSTANT.ROLES.user,
      //       isBot: true,
      //       isBlock: false,
      //       // coins: { $gte: realUser.coins },
      //       // cash: { $gte: realUser.cash },
      //       $or: [
      //         { coins: { $gte: Number(tournament.entryfee) } },
      //         // { cash: { $gte: Number(tournament.entryfee) } },
      //         // { winCash: { $gte: Number(tournament.entryfee) } },
      //         // { bonus: { $gte: Number(tournament.entryfee) } }
      //       ]
      //     }
      //   },
      //   { $sample: { size: 1 } } // Shuffle the documents and retrieve the first one
      // ]
      // let bots = await MongoService.aggregate(UserModel, query1)
      // Logger.info('getBot :: BEFORE :: bots :>> ' + JSON.stringify(bots));

      //get any Bot
      // if (bots.length == 0) {

        let query2 = [
          {
            $match: {
              _id: { $nin: busyBotIds },
              role: USER_CONSTANT.ROLES.user,
              isBot: true,
              isBlock: false,
              $or: [
                { coins: { $gte: Number(tournament.entryfee) } },
                // { cash: { $gte: Number(tournament.entryfee) } },
                // { winCash: { $gte: Number(tournament.entryfee) } },
                // { bonus: { $gte: Number(tournament.entryfee) } }
              ]
            }
          },
          { $sample: { size: 1 } } // Shuffle the documents and retrieve the first one
        ]
       let bots = await MongoService.aggregate(UserModel, query2)
      // }
      Logger.info('getBot :: AFTER :: bots :>> ' + JSON.stringify(bots));

      let isBotAvailable = false;
      let botDetails;

      if (bots.length > 0) {
        // check is bot has enough balance
        const entryFee = tournament.entryfee;

        for (let botIndex = 0; botIndex < bots.length; botIndex++) {
          const bot = bots[botIndex];

          const isInsufficiantBalance = tournament.entryfee > bot.coins ? true : false

          if (!isInsufficiantBalance) {
            isBotAvailable = true;
            botDetails = bot;

            // add bot into busy state
            const busyBot = await MongoService.create(BotBusyStatusModel, {
              insert: {
                botUserId: bot._id,
                tournamentId: tournamentId
              }
            });

            break;
          }else{
            let botData = await createRobot(tournamentId)
            Logger.info(`botData fetching successfully  ::  ${botData}`);
            if (!botData) {
              response.statusCode = STATUS_CODE.BAD_REQUEST;
              throw new Error(ERROR_MESSAGES.COMMON.SOMETHING_WENT_WRONG.replace(':attribute', 'botData'));
            }
            if (botData) {
              isBotAvailable = true;
              botDetails = botData;
            }
            break;
          }
        }
      } else {
        let botData1 = await createRobot(tournamentId)
        Logger.info(`botData1 fetching successfully  ::  ${botData1}`);
        if (!botData1) {
          response.statusCode = STATUS_CODE.BAD_REQUEST;
          throw new Error(ERROR_MESSAGES.COMMON.SOMETHING_WENT_WRONG.replace(':attribute', 'botData1'));
        }
        if (botData1) {
          isBotAvailable = true;
          botDetails = botData1;
        }
      }

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(':attribute', 'Bot details'),
          data: { isBotAvailable, botDetails }
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(`There was an issue into fetching a bot.: ${error}`);
      return next(error);
    }
  };

  private getBots = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { searchText, start, limit } = request.body;
      let query: any = {
        role: USER_CONSTANT.ROLES.user, isBot: true
      };

      if (searchText) {
        const regex = { $regex: new RegExp('^' + searchText + '', 'i') };

        query = {
          ...query,
          $or: [{ fullName: regex }]
        };
      }

      const bots: any = await Pagination(UserModel, {
        query,
        offset: start,
        limit
      });

      for (let i = 0; i < bots.docs.length; i++) {
        const isBotUsed = await MongoService.findOne(PlayedGamesModel, {
          query: { userId: bots.docs[i]._id }
        });

        if (isBotUsed) {
          bots.docs[i].isDeletable = false;
        } else {
          bots.docs[i].isDeletable = true;
        }

        const isBotBusy = await MongoService.findOne(BotBusyStatusModel, {
          query: { botUserId: bots.docs[i]._id },
          select: 'botUserId'
        });

        if (isBotBusy) {
          bots.docs[i].isBusy = true;
        } else {
          bots.docs[i].isBusy = false;
        }
      }

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(':attribute', 'Bots'),
          data: bots
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(`There was an issue into fetching a bots.: ${error}`);
      return next(error);
    }
  };

  private updateBot = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const req = request as RequestWithUser;
      const adminId = req.user._id;

      const { fullName,coins, isProfileImageUpdated, userId } = request.body;
      const isProfileImageUpdatedBoolean = Boolean(JSON.parse(isProfileImageUpdated));

            const bot: User = await MongoService.findOne(UserModel, {
        query: { _id: userId, role: USER_CONSTANT.ROLES.user, isBot: true }
      });
            Logger.info(`updateBot :: bot ::>> ${JSON.stringify(bot)}`);

      // check username exists or not
      const isUsernameExists = await MongoService.countDocuments(UserModel, {
        query: {
          _id: { $ne: userId },
          fullName: { $regex: new RegExp(`^${fullName}$`), $options: 'i' }
        }
      });

      if (!bot) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'bot'));
      } else if (isUsernameExists) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(ERROR_MESSAGES.COMMON.ALREADY_EXISTS.replace(':attribute', 'fullName'));
      } else if (coins < bot.coins) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(ERROR_MESSAGES.COMMON.GRATER_OR_EQUAL.replace(':attribute', 'coins').replace(':another', 'bot.coins'));
      } else {
        let updateData: UpdateBotData = {};

        if (isProfileImageUpdatedBoolean) {
          const file = request.file;
          const maxSize = USER_CONSTANT.PROFILE_IMAGE_FILE_SIZE;

          // validate profile image file
          await validateFile(request, file, 'profileImage', USER_CONSTANT.PROFILE_IMAGE_EXT_ARRAY, 'profile image', maxSize);

          const uploadResult = await uploadToS3(file, 'ProfileImages');

          if (uploadResult) {
            updateData = {
              ...updateData,
              profileImage: uploadResult.Location,
              profileImageKey: uploadResult.key,
            }
          } else {
            response.statusCode = STATUS_CODE.BAD_REQUEST;
            throw new Error('There was an issue into uploading bots profile image on s3 server.');
          }
        }

        updateData = {
          ...updateData,
          role: USER_CONSTANT.ROLES.user,
          fullName,
          coins,
          isBot: true,
          updateAdminId: adminId
        }

        // Update users data
        const updatedBot = await MongoService.findOneAndUpdate(UserModel, {
          query: { _id: userId },
          updateData: { $set: updateData }
        });


        return successMiddleware(
          {
            message: SUCCESS_MESSAGES.COMMON.UPDATE_SUCCESS.replace(':attribute', 'Bots'),
            data: updatedBot
          },
          request,
          response,
          next
        );
      }
    }
    catch (error) {
      Logger.error(`There was an issue into updating a bots.: ${error}`);
      return next(error);
    }

  }

  private deleteBot = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = req.body;

      const isBotExits = await MongoService.findOne(UserModel, {
        query: { _id: userId, isBot: true }
      })

      if (!isBotExits) {
        res.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'bot'));
      } else {
        const isBotUsed = await MongoService.findOne(PlayedGamesModel, {
          query: { userId: userId }
        })

        if (isBotUsed) {
          res.statusCode = STATUS_CODE.BAD_REQUEST;
          throw new Error(ERROR_MESSAGES.COMMON.ALREADY_IN_USE.replace(':attribute', 'bot'));
        } else {
          const deleteResult = await MongoService.deleteOne(UserModel, {
            query: { _id: userId }
          });
          return successMiddleware(
            {
              message: SUCCESS_MESSAGES.COMMON.DELETE_SUCCESS.replace(':attribute', 'Bot'),
              data: isBotExits
            },
            req,
            res,
            next
          );
        }
      }
    } catch (error) {
      Logger.error(`There was an issue into deleting a bot.: ${error}`);
      return next(error);
    }
  };
  createNeverExpireToken(userId: string) {
    const dataStoredInToken: DataStoredInToken = {
      _id: userId
    };

    return jwt.sign(dataStoredInToken, JWT_SECRET);
  }
}

export default BotController;
