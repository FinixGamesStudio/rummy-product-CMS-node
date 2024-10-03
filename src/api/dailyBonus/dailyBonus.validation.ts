import validate from '../../middleware/validate.middleware';
import { body } from 'express-validator';
import { DAILY_WHEEL_BONUS, ERROR_MESSAGES, } from '../../constant';

class DailyBonusValidation {
    addDailyBonus = () =>
        validate([
            body('day')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'day'))
                .isIn(DAILY_WHEEL_BONUS.DAILY_WHEEL_BONUS_DAYS)
                .withMessage(ERROR_MESSAGES.COMMON.IN.replace(':attribute', 'day').replace(':values', '[1, 2, 3, 4, 5, 6, 7]')),
            body('bonus')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'bonus'))
                .isFloat({ min: 0 })
                .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'bonus')),
        ]);

    getDailyBonusValidation = () =>
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

    updateDailyBonus = () =>
        validate([
            body('dailyBonusId')
                .notEmpty()
                .withMessage(
                    ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'dailyBonusId')
                )
                .isMongoId()
                .withMessage(
                    ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'dailyBonusId')
                ),
            body('day')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'day'))
                .isIn(DAILY_WHEEL_BONUS.DAILY_WHEEL_BONUS_DAYS)
                .withMessage(ERROR_MESSAGES.COMMON.IN.replace(':attribute', 'day').replace(':values', '[1, 2, 3, 4, 5, 6, 7]')),
            body('bonus')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'bonus'))
                .isFloat({ min: 0 })
                .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'bonus')),
        ]);

}

export default DailyBonusValidation;
