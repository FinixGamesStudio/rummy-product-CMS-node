import { body } from 'express-validator';
import { ERROR_MESSAGES } from '../../constant';
import validate from '../../middleware/validate.middleware';
import { isValidDate } from '../../utils/validationFunctions';



class headToHeadValidation{
    addHeadToHeadValidation = () =>
    validate([
      body('gameId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameId'))
        .isMongoId()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameId')),
      body('publisherId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'publisherId'))
        .isMongoId()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'publisherId')),
      // body('tournamentName')
      //   .optional({ nullable: true })
      //   .isLength({ max: 50 })
      //   .withMessage(ERROR_MESSAGES.COMMON.MAX.replace(':attribute', 'tournamentName').replace(':value', '50')),
      // body('description')
      //   .optional({ nullable: true })
      //   .isLength({ max: 50 })
      //   .withMessage(ERROR_MESSAGES.COMMON.MAX.replace(':attribute', 'description').replace(':value', '50')),
      body('entryfee')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'entryfee'))
        .isFloat({ min: 0 })
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'entryfee')),
      body('winningPrice')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'winningPrice'))
        .isFloat({ min: 0 })
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'winningPrice')),
      body('gameModeId')
        .optional({ nullable: true })
        .isMongoId()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameModeId')),
      body('isUseBot')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'isUseBot'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isUseBot')),
      body('isCash')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isCash')),
      body('gameType')
        .optional({ nullable: true })
        .isLength({ max: 50 })
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'gameType')),
      body('minPlayer')
        .optional({ nullable: true })
        .matches(/^[0-9]*$/)
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'minPlayer')),
      body('maxPlayer')
        .optional({ nullable: true })
        .matches(/^[0-9]*$/)
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'maxPlayer')),
      // body('lobbyType')
      //   .notEmpty()
      //   .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'lobbyType'))
      //   .isMongoId()
      //   .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'lobbyType')),
      body('noOfPlayer')
        .optional({ nullable: true })
        .isInt({ min: 0 })
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'noOfPlayer')),
      body('noOfDecks')
        .optional({ nullable: true })
        .isInt({ min: 0 })
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'noOfDecks')),
      body('isDummyPlayer')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'isDummyPlayer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isDummyPlayer')),
    ]);

    getHeadToHeadsValidation = () => 
    validate([
      body('searchText')
        .optional({ nullable: true }),
      body('gameId')
        .optional({ nullable: true })
        .isMongoId()
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameId')
        ),
      body('start')
        .optional({ nullable: true })
        .matches(/^[0-9]*$/)
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'start')),
      body('limit')
        .optional({ nullable: true })
        .matches(/^[0-9]*$/)
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'limit')),
      body('startDate')
        .optional({ nullable: true })
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID_FORMAT.replace(
            ':attribute',
            'startDate'
          ).replace(':format', 'YYYY-MM-DD')
        )
        .custom(async (value) => {
          const isDateValid = await isValidDate(value);
          if (!isDateValid) {
            return Promise.reject(
              ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'startDate')
            );
          } else {
            return Promise.resolve();
          }
        }),
      body('endDate')
        .optional({ nullable: true })
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID_FORMAT.replace(
            ':attribute',
            'endDate'
          ).replace(':format', 'YYYY-MM-DD')
        )
        .custom(async (value) => {
          const isDateValid = await isValidDate(value);
          if (!isDateValid) {
            return Promise.reject(
              ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'endDate')
            );
          } else {
            return Promise.resolve();
          }
        }),
      body('exportFile')
        .optional({ nullable: true })
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'exportFile')),
      body('csvDownload')
        .if(body('exportFile').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'csvDownload'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'csvDownload')),
    ]);

    updateHeadToHeadValidation = () =>
    validate([
      body('headToHeadId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'headToHeadId'))
        .isMongoId()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'headToHeadId')),
      body('gameId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameId'))
        .isMongoId()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameId')),
      body('publisherId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'publisherId'))
        .isMongoId()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'publisherId')),
      // body('tournamentName')
      //   .optional({ nullable: true })
      //   .isLength({ max: 50 })
      //   .withMessage(ERROR_MESSAGES.COMMON.MAX.replace(':attribute', 'tournamentName').replace(':value', '50')),
      // body('description')
      //   .optional({ nullable: true })
      //   .isLength({ max: 50 })
      //   .withMessage(ERROR_MESSAGES.COMMON.MAX.replace(':attribute', 'description').replace(':value', '50')),
      body('entryfee')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'entryfee'))
        .isFloat({ min: 0 })
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'entryfee')),
      body('winningPrice')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'winningPrice'))
        .isFloat({ min: 0 })
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'winningPrice')),
      body('gameModeId')
        .optional({ nullable: true })
        .isMongoId()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameModeId')),
      body('isCash')
        .optional()
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isCash')),
      body('isUseBot')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'isUseBot'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isUseBot')),
      // body('lobbyType')
      //   .notEmpty()
      //   .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'lobbyType'))
      //   .isMongoId()
      //   .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'lobbyType')),
      body('minPlayer')
        .optional({ nullable: true })
        .matches(/^[0-9]*$/)
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'minPlayer')),
      body('maxPlayer')
        .optional({ nullable: true })
        .matches(/^[0-9]*$/)
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'maxPlayer')),
      body('isDummyPlayer')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'isDummyPlayer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isDummyPlayer')),
    ]);

    deleteHeadToHeadValidation = () =>
    validate([
      body('headToHeadId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'headToHeadId'))
        .isMongoId()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'headToHeadId')),
    ]);

    activeDeactiveHeadToHeadValidation = () =>
    validate([
      body('headToHeadId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'headToHeadId'))
        .isMongoId()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'headToHeadId')),
      body('isActive')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'isActive'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isActive')),
    ]);
}

export default headToHeadValidation;
