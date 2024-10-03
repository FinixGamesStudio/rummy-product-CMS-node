import ENVIRONMENT from './environment';
import ROUTES from './route';
import SUCCESS_MESSAGES from './successMessages';
import ERROR_MESSAGES from './errorMessages';
import STATUS_CODE from './statueCode';
import GAME_CONSTANT from './gameConstant';
import USER_CONSTANT from './userConstant';
import TOURNAMENT_CONSTANT from './tournamentConstant';
import COMMON_CONSTANT from './commonConstant';
import TIME_ZONES_LIST from './timeZones';
import VALID_AGENT_ROLE_PERMISSION from './validAgentRolePermission';
import AVATAR_CONSTANT from './avatarConstant';
import COUNTRY_CONSTANT from './countryConstant';
import PLAYED_GAMES_CONSTANT from './playedGamesConstant';
import DAILY_WHEEL_BONUS from './dailyWheelBonusConstant';
import GAME_MODE_CONSTANT from './gameMode.constant';
import SUPER_ADMIN_CONFIG from './superAdminConfig.constant';
import LOBBY_TYPE_CONSTANTS from './lobbyTypeConstants';
import USER_GAME_RUNNING_STATUS_CONSTANT from './userGameRunningStatusConstant';
import AUTHENDICATION_CONSTANT from './authendicationConstant';
import INITIALIZE_SETUP_CONSTANT from './initializeSetupConstant';
import DAILY_WHEEL_BONUS_TYPE_CONSTANTS from './dailyWheelBonusTypeConstants';
import OFFER_CONSTANT from './offerConstant';
import ADMIN_NOTIFICATION_CONSTANT from './adminNotificationConstant';
import IN_APP_STORE_CONSTANT from './inAppStoreConstant';
import MAIL_CONFIG from './mailConfig';

const PERMISSION = VALID_AGENT_ROLE_PERMISSION.PERMISSION;

const exportObject = Object.freeze({
  ENVIRONMENT,
  ROUTES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  STATUS_CODE,
  GAME_CONSTANT,
  USER_CONSTANT,
  TOURNAMENT_CONSTANT,
  COMMON_CONSTANT,
  TIME_ZONES_LIST,
  VALID_AGENT_ROLE_PERMISSION,
  PERMISSION,
  COUNTRY_CONSTANT,
  PLAYED_GAMES_CONSTANT,
  DAILY_WHEEL_BONUS,
  GAME_MODE_CONSTANT,
  SUPER_ADMIN_CONFIG,
  LOBBY_TYPE_CONSTANTS,
  USER_GAME_RUNNING_STATUS_CONSTANT,
  AUTHENDICATION_CONSTANT,
  INITIALIZE_SETUP_CONSTANT,
  DAILY_WHEEL_BONUS_TYPE_CONSTANTS,
  OFFER_CONSTANT,
  ADMIN_NOTIFICATION_CONSTANT,
  IN_APP_STORE_CONSTANT,
  AVATAR_CONSTANT,
  MAIL_CONFIG
});

export = exportObject;
