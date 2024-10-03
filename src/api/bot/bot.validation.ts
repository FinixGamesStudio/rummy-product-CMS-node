import validate from '../../middleware/validate.middleware';
import { body } from 'express-validator';
import { ERROR_MESSAGES } from '../../constant';

class BotValidation {
  createBotValidation = () =>
    validate([
      body('fullName')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'fullName'))
        .isLength({ min: 2 })
        .withMessage(ERROR_MESSAGES.COMMON.MIN.replace(':attribute', 'full name').replace(':min', '2')),
      body('coins')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'coins'))
        .matches(/^[0-9]*$/)
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'coins')),
    ]);

  getBotsValidation = () =>
    validate([
      body('start')
        .optional({ nullable: true })
        .matches(/^[0-9]*$/)
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'start')),
      body('limit')
        .optional({ nullable: true })
        .matches(/^[0-9]*$/)
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'limit')),
      body('searchText')
        .optional({ nullable: true })
    ]);

  updateBotValidation = () =>
    validate([
      body('userId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'userId'))
        .isMongoId()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'userId')),
      body('fullName')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'fullName'))
        .isLength({ min: 2 })
        .withMessage(ERROR_MESSAGES.COMMON.MIN.replace(':attribute', 'fullName').replace(':min', '2')),
      body('coins')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'coins'))
        .matches(/^[0-9]*$/)
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'coins')),
body('isProfileImageUpdated')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'isProfileImageUpdated'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isProfileImageUpdated')),
    ]);

  deleteBotValidation = () =>
    validate([
      body('userId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'userId'))
        .isMongoId()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'userId')),
    ]);

    getBotValidation = () =>
      validate([
        body('tournamentId')
          .notEmpty()
          .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'tournamentId'))
          .isMongoId()
          .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'tournamentId'))
      ]);

}

export default BotValidation;