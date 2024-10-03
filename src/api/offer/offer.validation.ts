import validate from '../../middleware/validate.middleware';
import { body } from 'express-validator';
import { ERROR_MESSAGES, OFFER_CONSTANT } from '../../constant';
import { isValidDate } from '../../utils/validationFunctions';

class OfferValidation {
    addOfferValidation = () =>
        validate([
            body('offerName')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'offerName'))
                .isLength({ min: 2 })
                .withMessage(ERROR_MESSAGES.COMMON.MIN.replace(':attribute', 'offerName').replace(':min', '2')),
            body('offerDescription')
                .optional({ nullable: true }),
            body('startDate')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'startDate'))
                .matches(/^\d{4}-\d{2}-\d{2}$/)
                .withMessage(ERROR_MESSAGES.COMMON.INVALID_FORMAT.replace(':attribute', 'startDate').replace(':format', 'YYYY-MM-DD'))
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
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'endDate'))
                .matches(/^\d{4}-\d{2}-\d{2}$/)
                .withMessage(ERROR_MESSAGES.COMMON.INVALID_FORMAT.replace(':attribute', 'endDate').replace(':format', 'YYYY-MM-DD'))
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
            body('offerPrice')
                .notEmpty()
                .withMessage(
                    ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'offerPrice')
                )
                .isInt({ min: 0 })
                .withMessage(
                    ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'offerPrice')
                ),
            body('offerChips')
                .notEmpty()
                .withMessage(
                    ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'offerChips')
                )
                .isInt({ min: 0 })
                .withMessage(
                    ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'offerChips')
                ),
            body('packageId')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'packageId'))
                .isLength({ min: 2 })
                .withMessage(ERROR_MESSAGES.COMMON.MIN.replace(':attribute', 'packageId').replace(':min', '2')),
        ]);

    getOfferValidation = () =>
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

    updateOfferValidation = () =>
        validate([
            body('offerId')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'offerId'))
                .isMongoId()
                .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'offerId')),
            body('offerName')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'offerName'))
                .isLength({ min: 2 })
                .withMessage(ERROR_MESSAGES.COMMON.MIN.replace(':attribute', 'offerName').replace(':min', '2')),
            body('offerDescription')
                .optional({ nullable: true }),
            body('startDate')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'startDate'))
                .matches(/^\d{4}-\d{2}-\d{2}$/)
                .withMessage(ERROR_MESSAGES.COMMON.INVALID_FORMAT.replace(':attribute', 'startDate').replace(':format', 'YYYY-MM-DD'))
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
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'endDate'))
                .matches(/^\d{4}-\d{2}-\d{2}$/)
                .withMessage(ERROR_MESSAGES.COMMON.INVALID_FORMAT.replace(':attribute', 'endDate').replace(':format', 'YYYY-MM-DD'))
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
            body('offerPrice')
                .notEmpty()
                .withMessage(
                    ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'offerPrice')
                )
                .isInt({ min: 0 })
                .withMessage(
                    ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'offerPrice')
                ),
            body('offerChips')
                .notEmpty()
                .withMessage(
                    ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'offerChips')
                )
                .isInt({ min: 0 })
                .withMessage(
                    ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'offerChips')
                ),
            body('packageId')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'packageId'))
                .isLength({ min: 2 })
                .withMessage(ERROR_MESSAGES.COMMON.MIN.replace(':attribute', 'packageId').replace(':min', '2')),
            body('isImageUpdated')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'isImageUpdated'))
                .isBoolean()
                .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isImageUpdated')),
        ]);

    deleteOfferValidation = () =>
        validate([
            body('offerId')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'offerId'))
                .isMongoId()
                .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'offerId'))
        ]);
}

export default OfferValidation;