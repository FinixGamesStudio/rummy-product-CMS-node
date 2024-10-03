import validate from '../../middleware/validate.middleware';
import { body } from 'express-validator';
import { ERROR_MESSAGES, PLAYED_GAMES_CONSTANT } from '../../constant';

class UsersGameRunningStatusValidation {
  mgpAppMarkCompletedGameStatusValidation = () =>
    validate([
      body('gameId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameId'))
        .isMongoId()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameId')),
      body('tournamentId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'tournamentId'))
        .isMongoId()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'tournamentId')),
      body('tableId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'tableId'))
    ]);

  mgpAppGetUsersRunningGameStatusValidation = () =>
    validate([
      body('gameId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameId'))
        .isMongoId()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameId'))
    ]);
}

export default UsersGameRunningStatusValidation;
