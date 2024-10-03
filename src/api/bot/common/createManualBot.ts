import { response } from "express";
import { ERROR_MESSAGES, STATUS_CODE, USER_CONSTANT } from "../../../constant";
import Logger from "../../../logger";
import { MongoService } from "../../../utils";
import UserModel from "../../user/user.model";
import BotController from "../bot.controller";
import { bot_Name } from "../bot.interface";
import BotNameModel from "../bot_name.model";
import { Avatar } from "../../avatar/avatar.interface";
import AvatarModel from "../../avatar/avatar.model";
import HeadToHeadModel from "../../headToHead/headToHead.Model";

export async function createRobot(tournamentId: any) {

  let botcontroller = new BotController();
  
  try {

    const tournament = await MongoService.findOne(HeadToHeadModel, {
      query: { _id: tournamentId, isActive: true },
      select: '_id entryfee gameId'
    });
    Logger.info(`createRobot fetching successfully  ::  ${tournament}`);

    if (!tournament) {
      response.statusCode = STATUS_CODE.BAD_REQUEST;
      throw new Error(ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(':attribute', 'tournament'));
    }

    //get free avatar
    const freeAvatar: Avatar = await MongoService.findOne(AvatarModel, {
      query: { isFree: true },
      select: 'avatarImage isFree coins'
    });

    let query = [
      { $sample: { size: 1 } }, // Shuffle the documents and retrieve the first one
    ]
    let randomBoatName: bot_Name[] = await MongoService.aggregate(BotNameModel, query);
    Logger.info(`createRobot:: randomBoatName fetching successfully  ::  ${randomBoatName}`);

    let minBotCoins = Number(tournament.entryfee) + 100
    let maxBotCoins = Number(tournament.entryfee) + 1000

    Logger.info(`createRobot minBotCoins ::  ${minBotCoins}`);
    Logger.info(`createRobot maxBotCoins ::  ${maxBotCoins}`);

    const fullName = randomBoatName.length > 0 ? randomBoatName[0].name : await generateUserName(10)
    const signUpBonus = USER_CONSTANT.SIGNUP_BONUS;
    const signUpCash = USER_CONSTANT.SIGNUP_CASH;
    const coins = await GetRandomInt(minBotCoins, maxBotCoins)

    const BOT_DEFAULT = USER_CONSTANT.BOT_DEFAULT;

    const bot = await MongoService.create(UserModel, {
      insert: {
        profileImage: "https://oceantech-mgp.s3.amazonaws.com/mgp/ProfileImages/profileImage-1717521738762.png",
        profileImageKey: "mgp/ProfileImages/profileImage-1717086769192.jpg",
        role: USER_CONSTANT.ROLES.user,
        userName:fullName,
        bonus: signUpBonus,
        cash: signUpCash,
        coins,
        initialCash: signUpBonus + signUpCash,
        isBot: true,
        winCash: BOT_DEFAULT.WIN_CASH,
        longitude: BOT_DEFAULT.LONGITUDE,
        latitude: BOT_DEFAULT.LATITUDE,
        createAdminId: /*adminId*/"6605888d8ecbcada2d674188",
        updateAdminId: /*adminId*/"6605888d8ecbcada2d674188",
        useAvatar: freeAvatar._id,
        purchaseAvatars: [freeAvatar._id]
      }
    });
    Logger.info('createRobot ::  :: bot :>> ' + JSON.stringify(bot));

    const token = await botcontroller.createNeverExpireToken(bot._id);

    const updatedBot = await MongoService.findOneAndUpdate(UserModel, {
      query: { _id: bot._id },
      updateData: { token }
    });
    Logger.info('createRobot ::  :: updatedBot :>> ' + JSON.stringify(updatedBot));

    return updatedBot

  } catch (error) {
    Logger.error(`There was an issue into create a bot.: ${error}`);
    return false
  }
}


export async function generateUserName(length: number) {
  var charset = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ123456789",
    userName = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    userName += charset.charAt(Math.floor(Math.random() * n));
  }
  return userName;
}

export async function GetRandomInt(min: number, max: number) {
  const rnd =
    Math.floor(Math.random() * (max - min + 1)) +
    min;
  return Number(rnd);
};