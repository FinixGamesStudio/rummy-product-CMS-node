import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import TokenData from "../../interface/tokenData.interface";
import { MongoService } from "../../utils";
import { Register, User, UserRequest } from "../user/user.interface";
import UserModel from "../user/user.model";
import getconfig from "../../config";
import userConstant from "../../constant/userConstant";
import { USER_CONSTANT } from "../../constant";
import Logger from "../../logger";

const { JWT_SECRET } = getconfig();

class AuthenticationService {
  public User = UserModel;

  public async register(userData: UserRequest): Promise<Register> {
    if (
      await MongoService.findOne(this.User, {
        query: { email: userData.email },
      })
    ) {
      return { already: true };
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    let publisherStatus;
    let winCash;
    let totalDeposits;
    let totalWithdrawals = 0;
    let totalEarnings;
    let isReceivePromotions;
    let isUseCookie;
    let bonus;
    let deviceType;
    let platformFee;

    if (userData.role === userConstant.ROLES.user) {
      winCash = 0;
      totalDeposits = 0;
      bonus = 0;
      deviceType = userData.deviceType;
    } else if (userData.role === userConstant.ROLES.publisher) {
      // Note publisher default coins removed when final upload;
      publisherStatus = userConstant.PUBLISHER_STATUS.pending;
      totalEarnings = userConstant.DEFAULT_PUBLISHER_EARNINGS;
      isReceivePromotions = true;
      isUseCookie = true;
      platformFee = userConstant.DEFAULT_PLATFORM_FEE;
    }

    const user = await MongoService.create(this.User, {
      insert: {
        ...userData,
        password: hashedPassword,
        role: userData.role,
        publisherStatus: publisherStatus,
        winCash,
        totalDeposits,
        totalWithdrawals,
        totalEarnings,
        isReceivePromotions,
        isUseCookie,
        bonus,
        deviceType,
        platformFee,
      },
    });
    delete user.password;

    Logger.info("============>> user <<==========="+user);

    const tokenData: TokenData = this.createToken(user);
    return {
      tokenData,
      user,
    };
  }

  public createToken(user: User): TokenData {
    const expiresIn = 60 * 60; // an hour
    const secret = JWT_SECRET;
    const dataStoredInToken = {
      _id: user._id,
      role: USER_CONSTANT.ROLES.user,
      deviceId: "deviceId",
    };
    return {
      expiresIn,
      token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
    };
  }

  public generateRandomPassword(passlength: number): String {
    let pass = "";
    const randomString =
      "ABCDEFGHJKMNPQRSTUVWXYZ" + "abcdefghjkmnpqrstuvwxyz123456789@#$";

    for (let i = 1; i <= passlength; i++) {
      const char = Math.floor(Math.random() * randomString.length + 1);
      pass += randomString.charAt(char);
    }

    return pass;
  }

  public generateRandomUserName(userNamelength: number): String {
    let userName = "";
    const randomString = "ABCDEFGHJKMNPQRSTUVWXYZ" + "123456789";

    for (let i = 1; i <= userNamelength; i++) {
      const char = Math.floor(Math.random() * randomString.length + 1);
      userName += randomString.charAt(char);
    }

    return userName;
  }

  public generateRandomNumber(length: number): String {
    let randomNumber = "";
    const randomString = "123456789123456789123456789123456789123456789";

    for (let i = 1; i <= length; i++) {
      const char = Math.floor(Math.random() * randomString.length + 1);
      randomNumber += randomString.charAt(char);
    }

    return randomNumber;
  }

  public async getUniquePhoneNumber() {
    let phoneNumber = "";

    while (true) {
      phoneNumber = await this.generateRandomNumber(10).toString();

      const isUser = await MongoService.findOne(this.User, {
        query: {
          phoneNumber: {
            $regex: new RegExp(`^${phoneNumber}$`),
            $options: "i",
          },
        },
      });

      if (!isUser) {
        break;
      }
    }

    return phoneNumber;
  }

  public async getUniqueUserName() {
    let userName = "";

    while (true) {
      userName = await this.generateRandomUserName(10).toString();

      const isUser = await MongoService.findOne(this.User, {
        query: {
          userName: { $regex: new RegExp(`^${userName}$`), $options: "i" },
        },
      });

      if (!isUser) {
        break;
      }
    }

    return userName;
  }

  public generateRandomUserNameOnlyCharacter(userNamelength: number): String {
    let userName = "";
    const randomString = "ABCDEFGHJKMNPQRSTUVWXYZ";

    for (let i = 1; i <= userNamelength; i++) {
      const char = Math.floor(Math.random() * randomString.length + 1);
      userName += randomString.charAt(char);
    }

    return userName;
  }
}

export default AuthenticationService;
