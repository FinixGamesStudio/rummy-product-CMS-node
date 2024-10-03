import validate from '../../middleware/validate.middleware';
import { body, param } from 'express-validator';
import {
  ERROR_MESSAGES,
  GAME_CONSTANT
} from '../../constant';
import { isValidDate } from '../../utils/validationFunctions';

class GameValidation {
 
  getGameDetailsValidation = () =>
    validate([
      body('gameId')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameId')
        )
        .isMongoId()
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameId')
        )
    ]);
}
export default GameValidation;