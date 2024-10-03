import validate from '../../middleware/validate.middleware';
import { body } from 'express-validator';
import { DAILY_WHEEL_BONUS, ERROR_MESSAGES, } from '../../constant';

class dailyWheelBonusConfigValidation {
    adddailyWheelBonusConfig = () =>
        validate([
            body('rows')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'rows'))
                .isIn(DAILY_WHEEL_BONUS.DAILY_WHEEL_BONUS_ROWS)
                .withMessage(ERROR_MESSAGES.COMMON.IN.replace(':attribute', 'rows').replace(':values', '[2, 4, 6, 8]')),
        ]);
}

export default dailyWheelBonusConfigValidation;
