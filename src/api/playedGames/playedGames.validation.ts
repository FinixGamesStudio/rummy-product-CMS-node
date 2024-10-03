import validate from '../../middleware/validate.middleware';
import { body } from 'express-validator';
import { ERROR_MESSAGES, TOURNAMENT_CONSTANT } from '../../constant';
import { isValidDate } from '../../utils/validationFunctions';

class PlayedGamesValidation {
  getPlayedGamesValidation = () =>
    validate([
      body('gameId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameId'))
        .isMongoId()
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameId')
        ),
      body('gameModeId')
        .optional({ nullable: true })
        .isMongoId()
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameModeId')
        ),
      body('isGameModeOption')
        .optional({ nullable: true })
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isGameModeOption'))
    ]);

}

export default PlayedGamesValidation;
