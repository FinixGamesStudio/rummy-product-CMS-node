import { body } from 'express-validator';
import { ERROR_MESSAGES } from '../../constant';
import validate from '../../middleware/validate.middleware';

class GameNumberOfPlayerValidation {
    createGameNumberOfPlayerValidation = () =>
        validate([
            body('gameId')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameId'))
                .isMongoId()
                .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameId')),
            body('numberOfPlayer')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'numberOfPlayer'))
                .isInt({ min: 0 })
                .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'numberOfPlayer')),
            body('isDefault')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'isDefault'))
                .isBoolean()
                .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isDefault')),
        ]);

    getGameNumberOfPlayerValidation = () =>
        validate([
            body('gameId')
                .notEmpty()
                .withMessage(
                    ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameId')
                )
                .isMongoId()
                .withMessage(
                    ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameId')
                ),
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

    activeDeactiveGameNumberOfPlayerValidation = () =>
        validate([
            body('gameNumberOfPlayerId')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameNumberOfPlayerId'))
                .isMongoId()
                .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameNumberOfPlayerId')),
            body('isActive')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'isActive'))
                .isBoolean()
                .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isActive')),
        ]);

    updateGameNumberOfPlayerValidate = () =>
        validate([
            body('gameNumberOfPlayerId')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameNumberOfPlayerId'))
                .isMongoId()
                .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameNumberOfPlayerId')),
            body('numberOfPlayer')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'numberOfPlayer'))
                .isInt({ min: 0 })
                .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'numberOfPlayer')),
            body('isDefault')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'isDefault'))
                .isBoolean()
                .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isDefault')),
        ]);

    deleteGameNumberOfPlayerValidate = () =>
        validate([
            body('gameNumberOfPlayerId')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameNumberOfPlayerId'))
                .isMongoId()
                .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameNumberOfPlayerId')),
        ]);

    swapGameNumberOfPlayerPositionValidation = () =>
        validate([
            body('gameNumberOfPlayerId')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameNumberOfPlayerId'))
                .isMongoId()
                .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameNumberOfPlayerId')),
            body('gameId')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameId'))
                .isMongoId()
                .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameId')),
            body('oldPosition')
                .optional({ nullable: true })
                .matches(/^[0-9]*$/)
                .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'oldPosition')),
            body('newPosition')
                .optional({ nullable: true })
                .matches(/^[0-9]*$/)
                .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'newPosition'))
        ]);
}

export default GameNumberOfPlayerValidation