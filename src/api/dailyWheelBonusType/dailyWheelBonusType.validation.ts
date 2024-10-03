import validate from '../../middleware/validate.middleware';
import { body } from 'express-validator';
import { DAILY_WHEEL_BONUS, ERROR_MESSAGES, } from '../../constant';

class dailyWheelBonusTypeValidation {
    adddailyWheelBonusType = () =>
        validate([
            body('type')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'type'))
                .isIn(DAILY_WHEEL_BONUS.DAILY_WHEEL_BONUS_TYPES_ARRAY)
                .withMessage(ERROR_MESSAGES.COMMON.IN.replace(':attribute', 'type').replace(':values', '[ Bonus Coin, Referral Boosters, Add Coin Offer, Hard Luck]')),
            body('isDailyWheelBonusTypeTconUpdated')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'isDailyWheelBonusTypeTconUpdated'))
                .isBoolean()
                .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isDailyWheelBonusTypeTconUpdated')),
            body('title')
                .optional({ nullable: true })
                .isLength({ min: 2 })
                .withMessage(ERROR_MESSAGES.COMMON.MIN.replace(':attribute', 'title').replace(':min', '2')),
            body('description')
                .optional({ nullable: true })
                .isLength({ min: 2 })
                .withMessage(ERROR_MESSAGES.COMMON.MIN.replace(':attribute', 'description').replace(':min', '2'))
        ]);
}

export default dailyWheelBonusTypeValidation