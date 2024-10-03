import HeadToHeadController from './headToHead/headToHead.Controller';
import AuthenticationController from './authentication/authentication.controller';
import AdminNotificationController from './adminNotification/adminNotification.controller';
import AdminUserController from './adminUser/adminUser.controller';
import AnalyticsController from './analytics/analytics.controller';
import AvatarController from './avatar/avatar.controller';
import BotController from "./bot/bot.controller";          // Bot Not Use In Rummy Game But Add Depended On Future
import CountryController from './country/country.controller';
import DailyBonusController from "./dailyBonus/dailyBonus.controller";
import DailyWheelBonusController from './dailyWheelBonus/dailyWheelBonus.controller';
import dailyWheelBonusConfigController from './dailyWheelBonusConfig/dailyWheelBonusConfig.controller';
import DailyWheelBonusTypeController from './dailyWheelBonusType/dailyWheelBonusType.controller';
import DashboardController from './dashboard/dashboard.controller';
import GameController from './game/game.controller';
import GameModeController from './gameMode/gameMode.controller';
import UserController from './user/user.controller';
import InAppStoreController from './inAppStore/inAppStore.controller';
import OfferController from './offer/offer.controller';
import SubAdminUserController from './subAdminUser/subAdminUser.controller';



export=[
  new HeadToHeadController(),
  new AuthenticationController(),
  new AdminNotificationController(),
  new AvatarController(),
  new CountryController(),
  new DailyBonusController(),
  new DailyWheelBonusController(),
  new dailyWheelBonusConfigController(),
  new DailyWheelBonusTypeController(),
  new DashboardController(),
  new GameController(),
  new GameModeController(),
  new UserController(),
  new InAppStoreController(),
  new OfferController(),
  new SubAdminUserController(),
  new AdminUserController(),
  new AnalyticsController(),
  new BotController(),
]
