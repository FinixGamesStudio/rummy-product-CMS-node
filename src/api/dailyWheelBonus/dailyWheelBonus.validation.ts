import validate from '../../middleware/validate.middleware';
import { body } from 'express-validator';
import { DAILY_WHEEL_BONUS, ERROR_MESSAGES, } from '../../constant';

class DailyWheelBonusValidation {
    addDailyWheelBonus = () =>
        validate([
            body('day')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'day'))
                .isIn(DAILY_WHEEL_BONUS.DAILY_WHEEL_BONUS_DAYS)
                .withMessage(ERROR_MESSAGES.COMMON.IN.replace(':attribute', 'day').replace(':values', '[1, 2, 3, 4, 5, 6, 7]')),
            body('spinTitle')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'spinTitle'))
                .isLength({ min: 2 })
                .withMessage(ERROR_MESSAGES.COMMON.MIN.replace(':attribute', 'spinTitle').replace(':min', '2')),
            body('spinDescription')
                .optional({ nullable: true }),
            body('bonusType')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'bonusType'))
                .isArray()
                .withMessage(ERROR_MESSAGES.COMMON.ARRAY.replace(':attribute', 'bonusType')),
        ]);

    getDailyWheelBonusValidation = () =>
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

    updateDailyWheelBonus = () =>
        validate([
            body('dailyWheelBonusId')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'dailyWheelBonusId'))
                .isMongoId()
                .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'dailyWheelBonusId')),
            body('spinTitle')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'spinTitle'))
                .isLength({ min: 2 })
                .withMessage(ERROR_MESSAGES.COMMON.MIN.replace(':attribute', 'spinTitle').replace(':min', '2')),
            body('spinDescription')
                .optional({ nullable: true }),
            body('bonusType')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'bonusType'))
                .isArray()
                .withMessage(ERROR_MESSAGES.COMMON.ARRAY.replace(':attribute', 'bonusType')),
        ]);
}

export default DailyWheelBonusValidation;
