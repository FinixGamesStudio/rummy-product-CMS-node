import validate from '../../middleware/validate.middleware';
import { body } from 'express-validator';
import { ERROR_MESSAGES, IN_APP_STORE_CONSTANT } from '../../constant';

class InAppStoreValidation {
    addInAppStoreValidation = () =>
        validate([
            body('packageId')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'packageId'))
                .isLength({ min: 2 })
                .withMessage(ERROR_MESSAGES.COMMON.MIN.replace(':attribute', 'packageId').replace(':min', '2')),
            body('name')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'name'))
                .isLength({ min: 2 })
                .withMessage(ERROR_MESSAGES.COMMON.MIN.replace(':attribute', 'name').replace(':min', '2')),
            body('price')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'price'))
                .isInt({ min: 0 })
                .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'price')),
            body('coins')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'coins'))
                .isInt({ min: 0 })
                .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'coins')),
        ])

    updateInAppStoreValidation = () =>
        validate([
            body('inAppId')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'inAppId'))
                .isMongoId()
                .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'inAppId')),
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
            body('name')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'name'))
                .isLength({ min: 2 })
                .withMessage(ERROR_MESSAGES.COMMON.MIN.replace(':attribute', 'name').replace(':min', '2')),
            body('price')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'price'))
                .isInt({ min: 0 })
                .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'price')),
            body('coins')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'coins'))
                .isInt({ min: 0 })
                .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'coins')),
        ])

    deleteInAppStoreValidation = () =>
        validate([
            body('inAppId')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'inAppId'))
                .isMongoId()
                .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'inAppId'))
        ])

    getInAppValidation = () =>
        validate([
            body('inAppId')
                .notEmpty()
                .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'inAppId'))
                .isMongoId()
                .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'inAppId'))
        ])

    getInAppStoreValidation = () =>
        validate([
            body('limit')
                .optional({ nullable: true })
                .matches(/^[0-9]*$/)
                .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'limit')),
            body('start')
                .optional({ nullable: true })
                .matches(/^[0-9]*$/)
                .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'start'))
        ]);

}

export default InAppStoreValidation;