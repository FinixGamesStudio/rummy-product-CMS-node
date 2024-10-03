import multer from "multer";
import path from "path";
import {
  ERROR_MESSAGES,
  PERMISSION,
  ROUTES,
  STATUS_CODE,
  SUCCESS_MESSAGES,
  USER_CONSTANT,
} from "../../constant";
import { NextFunction, Request, Response, Router } from "express";
import UserModel from "./user.model";
import UserValidation from "./user.validation";
import PlayedGamesModel from "../playedGames/playedGames.model";
import Controller from "../../interface/controller.interface";
import Logger from "../../logger";
import { GetAllUsers, UpdateUserPersonalInfo } from "./user.interface";
import moment from "moment";
import { MongoService, Pagination } from "../../utils";
import { State } from "country-state-city";
import { exportFileFunction } from "../../utils/exportFileFunction";
import { successMiddleware } from "../../middleware/responseAPI.middleware";
import authMiddleware from "../../middleware/auth.middleware";
import roleMiddleware from "../../middleware/role.middleware";
import RequestWithUser from "../../interface/requestWithUser.interface";
import RequestWithComressImage from "../../interface/requestwithComressImagePath.interface";
import fs from "fs";
import { validateFile } from "../../utils/validationFunctions";
import { uploadToS3 } from "../../utils/s3";
import fileSize from "../../utils/imageCompress";
import mongoose from "mongoose";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../../uploads"));
  },
  filename: function (req, file, cb) {
    var datetimestamp = Date.now();
    cb(
      null,
      file.fieldname +
        "-" +
        datetimestamp +
        Math.random() * 9000 +
        1000 +
        "." +
        file.mimetype.split("/")[file.mimetype.split("/").length - 1]
    );
  },
});

const upload = multer({ storage: storage });

class UserController implements Controller {
  public path = `/${ROUTES.USER}`;
  public router = Router();
  private User = UserModel;
  private validation = new UserValidation();
  private PlayedGames = PlayedGamesModel;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.USER_VIEWER),
      this.validation.getAllUserValidation(),
      this.getAllUser
    );

    this.router.post(
      `${this.path}/getInactiveUsers`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.USER_VIEWER),
      this.validation.getInactiveUsersValidation(),
      this.getInactiveUsers
    );

    this.router.post(
      `${this.path}/block`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.USER_EDITOR),
      this.validation.blockUserValidation(),
      this.blockUser
    );

    this.router.post(
      `${this.path}/getUserProfile`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.USER_VIEWER),
      this.validation.getUserProfileValidation(),
      this.getUserProfile
    );

    this.router.post(
      `${this.path}/userDetails/updateUserPersonalInfo`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.USER_EDITOR),
      upload.single("profileImage"),
      fileSize,
      this.validation.updateUserPersonalInfoValidation(),
      this.updateUserPersonalInfo
    );

    this.router.post(
      `${this.path}/userGameStatistics`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.USER_VIEWER),
      this.validation.userGameStatisticsValidation(),
      this.getGameStatistics
    );

    this.router.post(
      `${this.path}/userDetails/updateUserBonus`,
      authMiddleware,
      roleMiddleware([USER_CONSTANT.ROLES.admin], PERMISSION.USER_EDITOR),
      this.validation.updateUserBonusValidation(),
      this.updateUserBonus
    );

    this.router.post(
      `${this.path}/getBlockUsers`,
      authMiddleware,
      roleMiddleware(
        [USER_CONSTANT.ROLES.admin],
        PERMISSION.USER_EDITOR
      ),
      this.validation.getAllBlockUserValidation(),
      this.getAllBlockUser
    );
  }

  private getAllUser = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      let { startDate, endDate } = request.body;
      const { searchText, start, limit, state } = request.body;
      const { csvDownload, exportFile, isBlock } = request.body;
      const pageStart = start ? start : 0;
      const pageLimit = limit ? limit : 10;

      let query: GetAllUsers = {};
      query = { ...query, role: USER_CONSTANT.ROLES.user, isBot: false, isBlock: false };

      if (startDate && endDate) {
        startDate = moment(startDate).startOf("day");
        endDate = moment(endDate).endOf("day");
        const isEndDateGrater = endDate.isSameOrAfter(startDate);

        if (isEndDateGrater) {
          query = {
            ...query,
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          };
        } else {
          response.statusCode = STATUS_CODE.NOT_FOUND;
          throw new Error(
            ERROR_MESSAGES.COMMON.GRATER.replace(
              ":attribute",
              "endDate"
            ).replace(":another", "startDate")
          );
        }
      }
      if (searchText) {
        const regex = { $regex: new RegExp("^" + searchText + "", "i") };

        query = {
          ...query,
          $or: [
            {
              userName: regex,
            },
            {
              nickName: regex,
            },
            {
              phoneNumber: regex,
            },
          ],
        };
      }
      if (state) {
        query = {
          ...query,
          state: state,
        };
      }

      // if (isBlock != undefined) {
      //   const isBlockBoolean = Boolean(JSON.parse(isBlock));
      //   query = {
      //     ...query,
      //     isBlock: isBlockBoolean,
      //   };
      // }

      const users: any = await Pagination(this.User, {
        query,
        offset: pageStart,
        limit: pageLimit,
      });

      let allStates: any = State.getStatesOfCountry("IN");
      allStates = allStates.map((name: any) => name.name);

      users.getAllState = allStates;

      const usersData: any = users.docs;

      usersData.map((obj: any) => {
        obj.totalCoins = obj.coins;
        return obj;
      });
      users.docs = usersData;
      let exportResponseData = [];
      for (let i = 0; i < usersData.length; i++) {
        exportResponseData.push({
          "Sr.No.": i + 1,
          "Users ID": `${usersData[i]._id}` ? `${usersData[i]._id}` : "",
          "Full Name": usersData[i].userName ? usersData[i].userName : "",
          "User Name": usersData[i].nickName ? usersData[i].nickName : "",
          "State Name": usersData[i].state ? usersData[i].state : "",
          'Country': usersData[i].country ? usersData[i].country : "",
          "Device Type": usersData[i].deviceType ? usersData[i].deviceType : "",
          "Device Id": usersData[i].deviceId ? usersData[i].deviceId : "",
          'Coins': usersData[i].coins ? usersData[i].coins : 0,
          // 'Cash': usersData[i].cash ? usersData[i].cash : 0,
          // "Win Cash": usersData[i].winCash ? usersData[i].winCash : 0,
          // 'Bonus': usersData[i].bonus ? usersData[i].bonus : 0,
          'Action' : usersData[i].isBlock ? "BLOCK" : "UNBLOCK",
          "Create Date": usersData[i].createdAt
            ? moment
                .utc(usersData[i].createdAt)
                .add(5, "hours")
                .add(30, "minutes")
                .format("MMM-DD-YYYY hh:mm A")
            : "",
          "Last Login Date": usersData[i].lastActivateAt
            ? moment
                .utc(usersData[i].lastActivateAt)
                .add(5, "hours")
                .add(30, "minutes")
                .format("MMM-DD-YYYY hh:mm A")
            : "",
        });
      }

      if (exportFile) {
        await exportFileFunction(
          csvDownload,
          "usersList",
          exportResponseData,
          response,
          request,
          next
        );
      } else {
        return successMiddleware(
          {
            message: SUCCESS_MESSAGES.USER_LIST,
            data: users,
          },
          request,
          response,
          next
        );
      }
    } catch (error) {
      Logger.error(`There was an issue into fetching all users.: ${error}`);
      return next(error);
    }
  };

  private getInactiveUsers = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      let { startDate } = request.body;
      const { searchText, start, limit, state } = request.body;
      const { csvDownload, exportFile, isBlock } = request.body;
      const pageStart = start ? start : 0;
      const pageLimit = limit ? limit : 10;

      let query: any = {
        role: USER_CONSTANT.ROLES.user,
        isBot: false,
      };

      if (startDate) {
        startDate = moment(startDate).startOf("day");

        query = {
          ...query,
          lastActivateAt: {
            $lte: new Date(startDate),
          },
        };
      }

      if (searchText) {
        const regex = { $regex: new RegExp("^" + searchText + "", "i") };

        query = {
          ...query,
          $or: [
            {
              email: regex,
            },
            {
              userName: regex,
            },
            {
              nickName: regex,
            },
            // {
            //   country: regex
            // },
            {
              phoneNumber: regex,
            },
            {
              state: regex,
            },
          ],
        };
      }

      // if (isBlock != undefined) {
      //   const isBlockBoolean = Boolean(JSON.parse(isBlock));
      //   query = {
      //     ...query,
      //     isBlock: isBlockBoolean,
      //   };
      // }

      if (state) {
        query = {
          ...query,
          state: state,
        };
      }

      const users: any = await Pagination(this.User, {
        query,
        offset: pageStart,
        limit: pageLimit,
        sort: { lastActivateAt: -1 },
      });

      let allStates: any = State.getStatesOfCountry("IN");
      allStates = allStates.map((name: any) => name.name);

      users.getAllState = allStates;

      const usersData: any = users.docs;

      usersData.map((obj: any) => {
        obj.totalCoins = obj.bonus;
        return obj;
      });

      users.docs = usersData;
      let exportResponseData = [];
      for (let i = 0; i < usersData.length; i++) {
        exportResponseData.push({
          "Sr.No.": i + 1,
          "Users ID": `${usersData[i]._id}` ? `${usersData[i]._id}` : "",
          "Full Name": usersData[i].userName ? usersData[i].userName : "",
          "User Name": usersData[i].nickName ? usersData[i].nickName : "",
          // Email: usersData[i].email ? usersData[i].email : "",
          "Phone Number": usersData[i].phoneNumber
            ? usersData[i].phoneNumber
            : "",
          "State Name": usersData[i].state ? usersData[i].state : "",
          "Country": usersData[i].country ? usersData[i].country : "",
          "Device Id": usersData[i].deviceId ? usersData[i].deviceId : "",
          "Device Type": usersData[i].deviceType ? usersData[i].deviceType : "",
          "Coins": usersData[i].coins ? usersData[i].coins : 0,
          'Action' : usersData[i].isBlock ? "BLOCK" : "UNBLOCK",
          // "Cash": usersData[i].cash ? usersData[i].cash : 0,
          // "Win Cash": usersData[i].winCash ? usersData[i].winCash : 0,
          // "Bonus": usersData[i].bonus ? usersData[i].bonus : 0,
          "Create Date": usersData[i].createdAt
            ? moment
                .utc(usersData[i].createdAt)
                .add(5, "hours")
                .add(30, "minutes")
                .format("MMM-DD-YYYY hh:mm A")
            : "",
          "Last Login Date": usersData[i].lastActivateAt
            ? moment
                .utc(usersData[i].lastActivateAt)
                .add(5, "hours")
                .add(30, "minutes")
                .format("MMM-DD-YYYY hh:mm A")
            : "",
        });
      }

      if (exportFile) {
        await exportFileFunction(
          csvDownload,
          "inActiveUsersList",
          exportResponseData,
          response,
          request,
          next
        );
      } else {
        return successMiddleware(
          {
            message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(
              ":attribute",
              "Inactive users"
            ),
            data: users,
          },
          request,
          response,
          next
        );
      }
    } catch (error) {
      Logger.error(
        `There was an issue into fetching an inactive users....: ${error}`
      );
      return next(error);
    }
  };

  private blockUser = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const req = request as RequestWithUser;
      const adminId = req.user._id;

      const { userId, isBlock } = request.body;

      const user = await MongoService.findOne(this.User, {
        query: { _id: userId, role: USER_CONSTANT.ROLES.user },
        lean: false,
      });

      if (!user) {
        response.statusCode = STATUS_CODE.NOT_FOUND;
        throw new Error(
          ERROR_MESSAGES.COMMON.INVALID.replace(":attribute", "user")
        );
      }

      user.isBlock = isBlock;
      user.updateAdminId = adminId;
      await user.save();

      const isBlockBoolean = Boolean(JSON.parse(isBlock));
      let successMessage = SUCCESS_MESSAGES.COMMON.BLOCK_SUCCESS.replace(
        ":attribute",
        "User"
      );
      if (!isBlockBoolean) {
        successMessage = SUCCESS_MESSAGES.COMMON.UNBLOCK_SUCCESS.replace(
          ":attribute",
          "User"
        );
      }

      return successMiddleware(
        {
          message: successMessage,
          data: user,
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(`There was an issue into blocking user.: ${error}`);
      return next(error);
    }
  };

  private getUserProfile = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = request.body;

      let user = await MongoService.findById(this.User, {
        query: userId,
        select: "-password",
      });

      if (user) {
        user.totalCoins = user.coins;
      }

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.USER_LIST,
          data: user,
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(`There was an issue into fetching user profile.: ${error}`);
      return next(error);
    }
  };

  private updateUserPersonalInfo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const requestAdmin = req as RequestWithUser;
    const adminId = requestAdmin.user._id;

    const file: any = req.file;
    const request = req as RequestWithComressImage;
    const compressImagePath = request.compressImagePath;
    const isProfileImageUpdatedBoolean = Boolean(
      JSON.parse(req.body.isProfileImageUpdated)
    );
    try {
      const { userId, isProfileImageUpdated, phoneNumber, fullName, country } =
        req.body;
      let updateData: UpdateUserPersonalInfo = {};

      const user = await MongoService.findOne(this.User, {
        query: { _id: userId, role: USER_CONSTANT.ROLES.user },
      });

      let { email } = req.body;

      if (email) {
        // check email exists or not
        const isEmailExists = await MongoService.countDocuments(this.User, {
          query: {
            _id: { $ne: userId },
            email: email,
          },
        });

        if (isEmailExists) {
          res.statusCode = STATUS_CODE.BAD_REQUEST;
          throw new Error(
            ERROR_MESSAGES.COMMON.ALREADY_EXISTS.replace(":attribute", "email")
          );
        } else {
          updateData.email = email;
        }
      }

      const isPhoneNumberExists = await MongoService.countDocuments(this.User, {
        query: {
          _id: { $ne: userId },
          phoneNumber: phoneNumber,
        },
      });

      if (isPhoneNumberExists) {
        res.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.ALREADY_EXISTS.replace(
            ":attribute",
            "phoneNumber"
          )
        );
      } else if (!user) {
        res.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(":attribute", "user")
        );
      }

      if (isProfileImageUpdatedBoolean) {
        const maxSize = USER_CONSTANT.PROFILE_IMAGE_FILE_SIZE;

        // validate profileImage file
        await validateFile(
          res,
          file,
          "profileImage",
          USER_CONSTANT.PROFILE_IMAGE_EXT_ARRAY,
          "profileImage",
          maxSize
        );

        // Note : User has not access to deletefile. And permission also not given beacuse risk of delete bucket.
        // const deleteImageResult = await deleteFromS3(user.profileImageKey);
        let fileObj = {
          path: compressImagePath,
          fieldname: "profileImage",
          originalname: file.originalname,
        };
        const uploadResult = await uploadToS3(fileObj, "ProfileImages", true);

        if (uploadResult) {
          updateData.profileImage = uploadResult.Location;
          updateData.profileImageKey = uploadResult.key;

          // remove file from local storeg
          fs.unlink(compressImagePath, function (err: any) {
            if (err) throw err;
          });
          fs.unlink(file.path, function (err: any) {
            if (err) throw err;
          });
        } else {
          res.statusCode = STATUS_CODE.BAD_REQUEST;
          throw new Error(
            "There was an issue into updating profile image on s3 server."
          );
        }
      }

      updateData.userName = fullName;
      updateData.phoneNumber = phoneNumber;
      updateData.country = country;
      updateData.updateAdminId = adminId;

      let updateQuery: any = { $set: updateData };
      if (email == undefined) {
        updateQuery["$unset"] = { email: 1 };
      }

      // Update users data
      const updatedUser = await MongoService.findOneAndUpdate(this.User, {
        query: { _id: userId },
        updateData: updateQuery,
      });

      const totalCoins = updatedUser.coins;

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.UPDATE_SUCCESS.replace(
            ":attribute",
            "Personal Info"
          ),
          data: { userData: updatedUser, totalCoins },
        },
        req,
        res,
        next
      );
    } catch (error) {
      // remove file from local storeg
      if (isProfileImageUpdatedBoolean) {
        fs.unlink(compressImagePath, function (err: any) {
          if (err) throw err;
        });
        fs.unlink(file.path, function (err: any) {
          if (err) throw err;
        });
      }

      Logger.error(
        `There was an issue into updating a user's personal info.: ${error}`
      );
      return next(error);
    }
  };

  private getGameStatistics = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const req = request as RequestWithUser;
      const userId = req.body.userId;
      console.log("userId :: ", userId);

      const isUserExists = await MongoService.findOne(this.User, {
        query: { _id: userId },
        select: "userName",
      });

      if (!isUserExists) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(":attribute", "user")
        );
      }

      //played gameData fetch
      let query = [
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
          $addFields: {
            "status.totalGames": {
              $sum: ["$status.win", "$status.loss", "$status.tie"],
            },
          },
        },
        {
          $project: {
            win: "$status.win",
            loss: "$status.loss",
            tie: "$status.tie",
            totalGames: "$status.totalGames",
          },
        },
      ];
      const userPlayedGames = await MongoService.aggregate(
        this.PlayedGames,
        query
      );
      console.log("userPlayedGames :: ", userPlayedGames);

      if (!userPlayedGames || userPlayedGames.length === 0) {
        throw new Error(`Can not found user played games for rummy game`);
      }
      console.log(" userPlayedGames :: ==>> ", userPlayedGames);

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.FETCH_SUCCESS.replace(
            ":attribute",
            "User game list"
          ),
          data: userPlayedGames[0],
        },
        req,
        response,
        next
      );
    } catch (error) {
      Logger.error(`There was an issue into integrating a game: ${error}`);
      return next(error);
    }
  };

  private updateUserBonus = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = request.body;
      let { bonus } = request.body;
      bonus = parseFloat(bonus);

      const req = request as RequestWithUser;
      const adminId = req.user._id;

      // Update users data
      const user = await MongoService.findOne(this.User, {
        query: { _id: userId, role: USER_CONSTANT.ROLES.user },
      });

      if (!user) {
        response.statusCode = STATUS_CODE.BAD_REQUEST;
        throw new Error(
          ERROR_MESSAGES.COMMON.NOT_EXISTS.replace(":attribute", "user")
        );
      }
      const totalCoins = +user.coins + bonus;

      // Update users data
      const updatedUser = await MongoService.findOneAndUpdate(this.User, {
        query: { _id: userId },
        updateData: { $set: { coins: totalCoins } },
      });

      return successMiddleware(
        {
          message: SUCCESS_MESSAGES.COMMON.UPDATE_SUCCESS.replace(
            ":attribute",
            "User bonus"
          ),
          data: { userData: updatedUser, totalCoins: updatedUser.coins },
        },
        request,
        response,
        next
      );
    } catch (error) {
      Logger.error(
        `There was an issue into updating a user's bonus.: ${error}`
      );
      return next(error);
    }
  };

  private getAllBlockUser = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    try {
      let { startDate, endDate } = request.body;
      const { searchText, start, limit, state } = request.body;
      const { csvDownload, exportFile, isBlock } = request.body;
      const pageStart = start ? start : 0;
      const pageLimit = limit ? limit : 10;

      let query: GetAllUsers = {};
      query = { ...query, role: USER_CONSTANT.ROLES.user, isBot: false, isBlock: true };

      if (startDate && endDate) {
        startDate = moment(startDate).startOf('day');
        endDate = moment(endDate).endOf('day');
        const isEndDateGrater = endDate.isSameOrAfter(startDate);

        if (isEndDateGrater) {
          query = {
            ...query,
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
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
          $or: [
            {
              fullName: regex
            },
            {
              nickName: regex
            },
            {
              phoneNumber: regex
            }
          ]
        };
      }

      if (state) {
        query = {
          ...query,
          state: state
        }
      }

      // if (isBlock != undefined) {
      //   const isBlockBoolean = Boolean(JSON.parse(isBlock));
      //   query = {
      //     ...query,
      //     isBlock: isBlockBoolean
      //   };
      // }

      const users: any = await Pagination(this.User, {
        query,
        offset: pageStart,
        limit: pageLimit
      });

      let allStates: any = State.getStatesOfCountry("IN");
      allStates = allStates.map((name: any) => (name.name))

      users.getAllState = allStates

      const usersData: any = users.docs;

      usersData.map((obj: any) => {
        obj.totalCoins = obj.coins
        return obj;
      })

      users.docs = usersData;
      let exportResponseData = []
      for (let i = 0; i < usersData.length; i++) {
        exportResponseData.push({
          'Sr.No.': i + 1,
          'Users ID': `${usersData[i]._id}` ? `${usersData[i]._id}` : "",
          'Full Name': usersData[i].userName ? usersData[i].userName : "",
          'User Name': usersData[i].nickName ? usersData[i].nickName : "",
          'State Name': usersData[i].state ? usersData[i].state : "",
          'Country': usersData[i].country ? usersData[i].country : "",
          'Device Id': usersData[i].deviceId ? usersData[i].deviceId : "",
          'Device Type': usersData[i].deviceType ? usersData[i].deviceType : "",
          'Coins': usersData[i].coins ? usersData[i].coins : 0,
          'Action' : usersData[i].isBlock ? "BLOCK" : "UNBLOCK",
          // 'Cash': usersData[i].cash ? usersData[i].cash : 0,
          // 'Win Cash': usersData[i].winCash ? usersData[i].winCash : 0,
          // 'Bonus': usersData[i].bonus ? usersData[i].bonus : 0,
          'Create Date': usersData[i].createdAt ? moment.utc(usersData[i].createdAt).add(5, 'hours').add(30, 'minutes').format('MMM-DD-YYYY hh:mm A') : "",
          'Last Login Date': usersData[i].lastActivateAt ? moment.utc(usersData[i].lastActivateAt).add(5, 'hours').add(30, 'minutes').format('MMM-DD-YYYY hh:mm A') : "",
        })
      }

      if (exportFile) {
        await exportFileFunction(csvDownload, 'usersList', exportResponseData, response, request, next);
      } else {
        return successMiddleware(
          {
            message: SUCCESS_MESSAGES.USER_LIST,
            data: users
          },
          request,
          response,
          next
        );
      }
    } catch (error) {
      Logger.error(`There was an issue into fetching all users.: ${error}`);
      return next(error);
    }
  };
}

export default UserController;
