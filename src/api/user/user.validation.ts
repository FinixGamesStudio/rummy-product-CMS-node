import { body, param } from 'express-validator';
import validate from '../../middleware/validate.middleware';
import { COUNTRY_CONSTANT, ERROR_MESSAGES } from '../../constant';
import { isValidDate } from '../../utils/validationFunctions';

class UserValidation {

  getAllUserValidation = () =>
    validate([
      body('searchText')
        .optional({ nullable: true }),
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
      body('isBlock')
        .optional({ nullable: true })
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isBlock')),
    ]);

  getInactiveUsersValidation = () =>
    validate([
      body('state')
        .optional({ nullable: true }),
      body('searchText')
        .optional({ nullable: true }),
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
      body('isBlock')
        .optional({ nullable: true })
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isBlock')),
    ]);

  blockUserValidation = () =>
    validate([
      body('userId')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'userId')
        )
        .isMongoId()
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'userId')
        ),
      body('isBlock')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'isBlock')
        )
        .isBoolean()
        .withMessage(
          ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isBlock')
        )
    ]);

  getUserProfileValidation = () =>
    validate([
      body('userId')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'userId')
        )
        .isMongoId()
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'userId')
        )
    ]);

  userGameStatisticsValidation = () =>
    validate([
      body('userId')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'userId')
        )
        .isMongoId()
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'userId')
        )
    ]);

  updateUserPersonalInfoValidation = () =>
    validate([
      body('userId')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'userId')
        )
        .isMongoId()
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'userId')
        ),
      body('fullName')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'fullName')
        )
        .isLength({ min: 2 })
        .withMessage(
          ERROR_MESSAGES.COMMON.MIN.replace(':attribute', 'fullName').replace(
            ':min',
            '2'
          )
        ),
      body('email')
        .optional({ nullable: true })
        .matches(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/)
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'email')
        ),
      body('phoneNumber')
        .optional({ nullable: true })
        // .withMessage(
        //   ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'phoneNumber')
        // )
        .matches(/^[0-9]*$/)
        .withMessage(
          ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'phoneNumber')
        ),
      // .isLength({ max: 10, min: 10 })
      // .withMessage(
      //   ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'phoneNumber')
      // ),
      body('country')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'country')
        )
        .isIn(COUNTRY_CONSTANT.VALID_COUNTRY_NAMES)
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'country')),
      body('isProfileImageUpdated')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'isProfileImageUpdated')
        )
        .isBoolean()
        .withMessage(
          ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isProfileImageUpdated')
        ),
    ]);

  updateUserBonusValidation = () =>
    validate([
      body('userId')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'userId')
        )
        .isMongoId()
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'userId')
        ),
      body('bonus')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'bonus')
        )
        .isFloat({ min: 0 })
        .withMessage(
          ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'bonus')
        )
    ]);

    getAllBlockUserValidation = () =>
    validate([
      body('searchText')
        .optional({ nullable: true }),
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
      body('isBlock')
        .optional({ nullable: true })
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isBlock')),
    ]);

}

export default UserValidation;
