import { Router, Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcrypt';
import fs from 'fs'
import path from 'path';
import Controller from '../../interface/controller.interface';
import AvatarModel from '../avatar/avatar.model';
import UserModel from '../user/user.model';
import Logger from '../../logger/index';
import { successMiddleware } from '../../middleware/responseAPI.middleware';
import { MongoService } from '../../utils';
import AuthenticationService from '../authentication/authentication.service';
import { uploadToS3 } from '../../utils/s3';
import authMiddleware from '../../middleware/auth.middleware';
import roleMiddleware from '../../middleware/role.middleware';
import PlayedGamesModel from '../playedGames/playedGames.model';
import {
    ROUTES,
    SUCCESS_MESSAGES,
    ERROR_MESSAGES,
    STATUS_CODE,
    USER_CONSTANT,
    INITIALIZE_SETUP_CONSTANT,
    PLAYED_GAMES_CONSTANT
} from '../../constant';
import InitializeSetupModel from './intializeSetup.model';
import mongoose from 'mongoose';

class IntializeSetupController implements Controller {
    public path = `/${ROUTES.INTIALIZE_SETUP}`;
    public router = Router();
    private InitializeSetup = InitializeSetupModel;
    private Avatar = AvatarModel;
    private User = UserModel;
    public authenticationService = new AuthenticationService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(
            `${this.path}`,
            this.initializeSetup
        );

        this.router.post(
            `/clearUserData`,
            this.clearUserData
        );

        this.router.post(
            `/clearGameData`,
            this.clearGameData
        );

        this.router.post(
            `/addAdminUser`,
            this.addAdminUser
        );

        this.router.post(
            `/clearUserDataIdWise`,
            this.clearUserDataIdWise
        );

        this.router.post(
            `${this.path}/clearDataFromModel`,
            authMiddleware,
            roleMiddleware([USER_CONSTANT.ROLES.admin]),
            this.clearDataFromModel
        );
    };

    private initializeSetup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let isInitializeSetup = await MongoService.findOne(this.InitializeSetup, {});

            if (isInitializeSetup) {
                res.statusCode = STATUS_CODE.BAD_REQUEST;
                throw new Error(ERROR_MESSAGES.COMMON.ALREADY_EXISTS.replace(':attribute', 'initialize setup'));
            } else {
                isInitializeSetup = await MongoService.create(this.InitializeSetup, {
                    insert: {
                        initializeSetup: true
                    }
                });

                await this.addAvtar();

                return successMiddleware(
                    {
                        message: SUCCESS_MESSAGES.COMMON.CREATE_SUCCESS.replace(
                            ':attribute',
                            'Initialize setup'
                        ),
                        data: isInitializeSetup
                    },
                    req,
                    res,
                    next
                );
            }

        } catch (error) {
            Logger.error(`There was an issue into create initialize setup.: ${error}`);
            return next(error);
        }
    }

    private addAdminUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let isAdminExists = await MongoService.findOne(UserModel, {
                query: {
                    role: INITIALIZE_SETUP_CONSTANT.ROLES.admin
                }
            });

            if (isAdminExists) {
                res.statusCode = STATUS_CODE.BAD_REQUEST;
                throw new Error(ERROR_MESSAGES.COMMON.ALREADY_EXISTS.replace(':attribute', 'admin'));
            } else {
                const admin = await this.addAdmin();

                return successMiddleware(
                    {
                        message: SUCCESS_MESSAGES.COMMON.CREATE_SUCCESS.replace(
                            ':attribute',
                            'Admin'
                        ),
                        data: admin
                    },
                    req,
                    res,
                    next
                );
            }

        } catch (error) {
            Logger.error(`There was an issue into create admin user.: ${error}`);
            return next(error);
        }
    }

    private addAvtar = () => {
        const imagePath = path.join(__dirname + INITIALIZE_SETUP_CONSTANT.UPLOADS_PATH);

        fs.readdir(
            path.resolve(imagePath, 'avtarImages'), async (err, files) => {
                if (err) {
                    throw err;
                }

                for (let file of files) {
                    let filePath = path.join(imagePath + '/avtarImages/' + file);
                    let fileObj = {
                        path: filePath,
                        fieldname: 'avatarImage',
                        originalname: file
                    }
                    await this.uploadAvtarData(fileObj);
                }
            }
        );
    }

    private async getUniqueAvtarName() {
        let avtarName = '';
        while (true) {
            // create avtar name like     Avtar-1234-abdef
            avtarName = await this.authenticationService.generateRandomUserName(5).toString();
            avtarName = 'Avtar-' + await this.authenticationService.generateRandomNumber(4) + '-' + avtarName

            const isAvtar = await MongoService.findOne(this.Avatar, {
                query: { avatarName: { $regex: new RegExp(`^${avtarName}$`), $options: 'i' } }
            });

            if (!isAvtar) {
                break;
            }
        }
        return avtarName;
    }

    private async uploadAvtarData(file: any) {
        const avatarName = await this.getUniqueAvtarName();

        const uploadResult = await uploadToS3(file, 'AvatarImages', true);

        if (uploadResult) {
            const avatar = await MongoService.create(this.Avatar, {
                insert: {
                    avatarName: avatarName,
                    avatarImage: uploadResult.Location,
                    imageKey: uploadResult.key
                }
            });
        }
    }

    private async addAdmin() {
        // chack admin is available or not
        const isAdminExists = await MongoService.findOne(this.User, {
            query: { role: INITIALIZE_SETUP_CONSTANT.ROLES.admin }
        });

        if (!isAdminExists) {
            const email = INITIALIZE_SETUP_CONSTANT.EMAIL;
            const password = INITIALIZE_SETUP_CONSTANT.PASSWORD;
            const userName = INITIALIZE_SETUP_CONSTANT.FULLNAME;
            const isBlock = INITIALIZE_SETUP_CONSTANT.IS_BLOCK;
            const isAvatarAsProfileImage = INITIALIZE_SETUP_CONSTANT.IS_AVATAR_AS_PROFILE_IMAGE;

            const isEmailExists = await MongoService.findOne(this.User, {
                query: { email }
            });

            if (!isEmailExists) {
                const hashedPassword = await bcrypt.hash(password, 10);

                let totalWithdrawals = 0;

                const user = await MongoService.create(this.User, {
                    insert: {
                        email,
                        password: hashedPassword,
                        role: INITIALIZE_SETUP_CONSTANT.ROLES.admin,
                        totalWithdrawals,
                        userName,
                        isBlock,
                        isAvatarAsProfileImage
                    }
                });
            }
        }
    }

    private clearUserData = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        try {
            const modelNameArray = [
                'AdminNotification',
                'Install',
                'BonusClaimed',
                'EngagementAnalytics',
                // 'UserOtp',
                'BlockUser',
                "BotBusyStatus",
                // 'GameMatchMaking',
                "ForgotPassword",
                "HelpAndSupport",
                // "Leaderboard",
                // "LeaderboardHistory",
                'LoginOtp',
                // 'mgpWalletHistory',
                'OtherOtp',
                // "PaymentHistory",
                "PhoneNumberUpdateRequest",
                "PlayedGames",
                // "ReferAndEarnLeaderboard",
                // "ReferAndEarnLeaderboardHistory",
                "ReferDetails",
                // "TransactionHistory",
                'userActiveStatus',
                "UserClaimBonus",
                "UserClaimedCoupon",
                "UserClaimedOffer",
                'UserFirstTimeIntrection',
                "UserInstalledGame",
                'UserIntalledMGPApp',
                "UserNote",
                'UserNotification',
                'UsersOffer',
                // "UserReported",
                // "UsersCoupon",
                "UsersGameRunningStatus",
                "UserOldPhoneNumber",
                "UserTimeout",
                'UserUnInstallGame',
            ]

            const reponseData = [];
            for (let i = 0; i < modelNameArray.length; i++) {
                const modelName = modelNameArray[i];
                const model = mongoose.model(modelName);
                const deleteResult = await model.deleteMany({});
                reponseData.push(deleteResult)
            }

            const deleteUser = await MongoService.deleteMany(UserModel, {
                query: { role: "User" }
            })

            reponseData.push(deleteUser)

            return successMiddleware(
                {
                    message: SUCCESS_MESSAGES.COMMON.DELETE_SUCCESS.replace(
                        ':attribute',
                        'User data'
                    ),
                    data: { NumberOfModuleDeleted: reponseData.length, reponseData }
                },
                request,
                response,
                next
            );
        } catch (error) {
            Logger.error(`There was an issue into deleting user data.: ${error}`);
            return next(error);
        }
    };

    private clearGameData = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        try {
            const modelNameArray = [
                "BonusClaimed",
                "EngagementAnalytics",
                "Install",
                "DummyPlayer",
                "GameBuild",
                "GameConfig",
                "GameMode",
                "GameModeDesignConfig",
                // "GameMonthlyLeaderboardBonusConfig",
                // "GameMonthlyLeaderboardRankConfig",
                "GameNumberOfDeck",
                "GameNumberOfPlayer",
                "GameRadiusLocation",
                "GameRelease",
                "HelpAndSupport",
                "HowToPlay",
                "InternalAds",
                // "Leaderboard",
                // "LeaderboardHistory",
                "PlayedGames",
                "PlayingTracking",
                "PopularGame",
                // "Tds",
                // "Tournament",
                // "TransactionHistory",
                "UserFirstTimeIntrection",
                // "userGSTAmount",
                "UserInstalledGame",
                "UsersGameRunningStatus"
            ]

            const reponseData = [];
            for (let i = 0; i < modelNameArray.length; i++) {
                const modelName = modelNameArray[i];
                const model = mongoose.model(modelName);
                const deleteResult = await model.deleteMany({});
                reponseData.push(deleteResult)
            }

            return successMiddleware(
                {
                    message: SUCCESS_MESSAGES.COMMON.DELETE_SUCCESS.replace(
                        ':attribute',
                        'Game data'
                    ),
                    data: { NumberOfModuleDeleted: reponseData.length, reponseData }
                },
                request,
                response,
                next
            );
        } catch (error) {
            Logger.error(`There was an issue into deleting game data.: ${error}`);
            return next(error);
        }
    };

    private clearDataFromModel = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        try {
            const { modelName } = request.body;

            const model = mongoose.model(modelName);
            const deleteResult = await model.deleteMany({});

            return successMiddleware(
                {
                    message: SUCCESS_MESSAGES.COMMON.DELETE_SUCCESS.replace(
                        ':attribute',
                        'Data'
                    ),
                    data: deleteResult
                },
                request,
                response,
                next
            );
        } catch (error) {
            Logger.error(`There was an issue into deleting data from models.: ${error}`);
            return next(error);
        }
    };

    private clearUserDataIdWise = async (
        request: Request,
        response: Response,
        next: NextFunction
    ) => {
        try {

            const { userIds } = request.body

            const modelNameArray = [
                "ForgotPassword",
                "BlockUser",
                "BotBusyStatus",
                "HelpAndSupport",
                "GameRelease",
                "Leaderboard",
                "LeaderboardHistory",
                "PaymentHistory",
                "PhoneNumberUpdateRequest",
                "PlayedGames",
                "RazorpayAccount",
                "ReferAndEarnLeaderboard",
                "ReferAndEarnLeaderboardHistory",
                "ReferDetails",
                "Tds",
                "TransactionHistory",
                "UserClaimBonus",
                "UserClaimedCoupon",
                "UserClaimedOffer",
                "UserDepositLimit",
                "UserInstalledGame",
                "UserKYCAadharCard",
                "UserKYCPanCard",
                "UserKYCUpdateRequest",
                "UserNote",
                "UserOldPhoneNumber",
                "UserReported",
                "UsersCoupon",
                "UsersGameRunningStatus",
                "UserTimeout",
                "mgpWalletHistory"
            ]

            const reponseData = [];
            for (let i = 0; i < modelNameArray.length; i++) {
                const modelName = modelNameArray[i];
                const model = mongoose.model(modelName);

                const deleteResult = await model.deleteMany({ userId: { $in: userIds } });
                reponseData.push(deleteResult)
            }

            return successMiddleware(
                {
                    message: SUCCESS_MESSAGES.COMMON.DELETE_SUCCESS.replace(
                        ':attribute',
                        'User data'
                    ),
                    data: { NumberOfModuleDeleted: reponseData.length, reponseData }
                },
                request,
                response,
                next
            );
        } catch (error) {
            Logger.error(`There was an issue into deleting user data.: ${error}`);
            return next(error);
        }
    };
}

export default IntializeSetupController