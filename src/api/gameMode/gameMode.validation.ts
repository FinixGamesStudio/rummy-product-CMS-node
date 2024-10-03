import validate from '../../middleware/validate.middleware';
import { body } from 'express-validator';
import {
  ERROR_MESSAGES
} from '../../constant';

class GameModeValidation {
  addGameModeValidation = () =>
    validate([
     body('gameId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameId'))
        .isMongoId()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameId')),
      body('gameModeName')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameModeName')),
      body('gameTypeName')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameTypeName')),
      body('isIconAdded')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'isIconAdded'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isIconAdded')),
    ]);

  updateGameModeValidation = () =>
    validate([
     body('gameId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameId'))
        .isMongoId()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameId')),
      body('gameModeId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameModeId'))
        .isMongoId()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameModeId')),
      body('gameModeName')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameModeName')),
      body('gameTypeName')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameTypeName')),
      body('isIconUpdated')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'isIconUpdated'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isIconUpdated')),
      body('isIconDeleted')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'isIconDeleted'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isIconDeleted')),
    ]);

  deleteGameModeValidation = () =>
    validate([
     body('gameId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameId'))
        .isMongoId()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameId')),
      body('gameModeId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameModeId'))
        .isMongoId()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameModeId'))
    ]);

  getGameModesValidation = () =>
    validate([
      body('gameId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameId'))
        .isMongoId()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameId')),
      body('start')
        .optional({ nullable: true })
        .matches(/^[0-9]*$/)
        .withMessage(
          ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'start')
        ),
      body('limit')
        .optional({ nullable: true })
        .matches(/^[0-9]*$/)
        .withMessage(
          ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'limit')
        )
    ]);

  swapGameModePositionValidation = () =>
    validate([
      body('gameModeId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameModeId'))
        .isMongoId()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameModeId')),
      body('oldPosition')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'oldPosition'))
        .matches(/^[0-9]*$/)
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'oldPosition')),
      body('newPosition')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'newPosition'))
        .matches(/^[0-9]*$/)
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'newPosition'))
    ]);
}

export default GameModeValidation;