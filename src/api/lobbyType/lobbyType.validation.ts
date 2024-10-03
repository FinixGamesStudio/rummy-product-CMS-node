import validate from '../../middleware/validate.middleware';
import { body } from 'express-validator';
import { ERROR_MESSAGES, TOURNAMENT_CONSTANT, LOBBY_TYPE_CONSTANTS } from '../../constant';

class LobbyTypeValidation {
    addLobbyTypeValidation = () =>
        validate([
            body('lobbyType')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'lobbyType'))
                .isIn(LOBBY_TYPE_CONSTANTS.LOBBY_TITLE_ARRAY)
                .withMessage(ERROR_MESSAGES.COMMON.IN.replace(':attribute', 'type')
                .replace(':values', '[CONTEST, BATTLE]')),
            body('description')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'description'))
                .isLength({ min: 2 })
                .withMessage(ERROR_MESSAGES.COMMON.MIN.replace(':attribute', 'description').replace(':min', '2')),
            body('type')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'type'))
                .isIn(TOURNAMENT_CONSTANT.LOBBY_TYPE_ARRAY)
                .withMessage(ERROR_MESSAGES.COMMON.IN.replace(':attribute', 'type')
                .replace(':values', '[HeadToHead, Contest]')),
        ]);

    getLobbyTypeValidation = () =>
        validate([
            body('start')
                .optional({ nullable: true })
                .matches(/^[0-9]*$/)
                .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'start')),
            body('limit')
                .optional({ nullable: true })
                .matches(/^[0-9]*$/)
                .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'limit'))
        ]);

    updateLobbyTypeValidation = () =>
        validate([
            body('lobbyTypeId')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'lobbyTypeId'))
                .isMongoId()
                .withMessage(
                    ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'lobbyTypeId')
                ),
            body('lobbyType')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'lobbyType'))
                .isIn(LOBBY_TYPE_CONSTANTS.LOBBY_TITLE_ARRAY)
                .withMessage(ERROR_MESSAGES.COMMON.IN.replace(':attribute', 'type')
                .replace(':values', '[CONTEST, BATTLE]')),
            body('isLobbyTypeIconUpdated')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'isLobbyTypeIconUpdated'))
                .isBoolean()
                .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isLobbyTypeIconUpdated')),
            body('description')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'description'))
                .isLength({ min: 2 })
                .withMessage(ERROR_MESSAGES.COMMON.MIN.replace(':attribute', 'description').replace(':min', '2')),
             body('type')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'type'))
                .isIn(TOURNAMENT_CONSTANT.LOBBY_TYPE_ARRAY)
                .withMessage(ERROR_MESSAGES.COMMON.IN.replace(':attribute', 'type')
                .replace(':values', '[HeadToHead, Contest]')),
        ]);

    deleteLobbyTypeValidation = () =>
        validate([
            body('lobbyTypeId')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'lobbyTypeId'))
                .isMongoId()
                .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'lobbyTypeId'))
        ]);
}

export default LobbyTypeValidation