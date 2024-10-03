import validate from '../../middleware/validate.middleware';
import { body } from 'express-validator';
import { ERROR_MESSAGES } from '../../constant';

class CountryValidation {
  getStateOfCountryValidation = () =>
    validate([
      body('isoCode')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'isoCode'))
        .isLength({ min: 2, max: 2 })
        .withMessage(ERROR_MESSAGES.COMMON.EXACT.replace(':attribute', 'isoCode').replace(':value', '2'))
    ]);
}

export default CountryValidation;