import validate from '../../middleware/validate.middleware';
import { body } from 'express-validator';
import { ERROR_MESSAGES } from '../../constant';
import { isValidDate } from '../../utils/validationFunctions';

class AnalyticsValidation {
  getInstallsValidation = () =>
    validate([
      body('publisherId')
        .optional({ nullable: true })
        .isMongoId()
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'publisherId')
        ),
      body('gameId')
        .optional({ nullable: true })
        .isMongoId()
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameId')
        ),
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
        })
    ]);

  startDateEndDateValidation = () =>
    validate([
      body('startDate')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'startDate')
        )
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
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'endDate')
        )
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
        })
    ]);

  engagementValidation = () =>
    validate([
      body('gameId')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameId')
        )
        .isMongoId()
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameId')
        )
        .optional(),
      body('export')
        .isBoolean()
        .withMessage('Must be a boolean true or false')
        .optional(),
      body('startDate')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'startDate')
        )
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
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'endDate')
        )
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
        })
    ]);

  sendRevenueReportValidation = () =>
    validate([
      body('gameId')
        .optional({ nullable: true })
        .isMongoId()
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameId')
        ),
      body('export')
        .isBoolean()
        .withMessage('Must be a boolean true or false')
        .optional(),
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
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'csvDownload'))
    ]);

  playGameAnalyticsValidation = () =>
    validate([
      body('isCash')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'isCash')
        )
        .isBoolean()
        .withMessage('Must be a boolean true or false'),
      body('gameId')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gameId')
        )
        .isMongoId()
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameId')
        ),
      body('publisherId')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'publisherId')
        )
        .isMongoId()
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'publisherId')
        ),
      body('tournamentId')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'tournamentId')
        )
        .isMongoId()
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'tournamentId')
        )
    ]);

  validateId = (fieldName: string) =>
    validate([
      body(fieldName)
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', fieldName)
        )
        .isMongoId()
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', fieldName)
        )
    ]);

  validateOptionalId = (fieldName: string) =>
    validate([
      body(fieldName)
        .optional({ nullable: true })
        .isMongoId()
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', fieldName)
        )
    ]);

  getUserReportValidation = () =>
    validate([
      body('startDate')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'startDate')
        ),
      body('endDate')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'endDate')
        ),
      body('gameId')
        .optional({ nullable: true })
        .isMongoId()
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameId')
        ),
      body('publisherId')
        .optional({ nullable: true })
        .isMongoId()
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'publisherId')
        ),
      body('exportFile')
        .optional({ nullable: true })
        .isBoolean()
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'exportFile')
        ),
      body('csvDownload')
        .optional({ nullable: true })
        .isBoolean()
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'csvDownload')
        )
    ]);

  enagementTableSeeder = () =>
    validate([
      body('numberOfRecord')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'numberOfRecord')
        )
        .matches(/^[0-9]*$/)
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'numberOfRecord'))
    ]);

  createBonusClaimValidation = () =>
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
      body('amount')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'amount')
        )
        .matches(/^[0-9]*$/)
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'amount'))
    ]);

  getReportValidation = () =>
    validate([
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
    ])

  getUserGSTReportValidation = () =>
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
      body('gameId')
        .optional({ nullable: true })
        .isMongoId()
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'gameId')
        ),
      body('startDate')
        .optional({ nullable: true })
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
        .optional({ nullable: true })
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID_FORMAT.replace(':attribute', 'endDate').replace(':format', 'YYYY-MM-DD'))
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
    ])

  getDailyReportValidation = () =>
    validate([
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
    ])

  getUserIntalledValidation = () =>
    validate([
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
    ])
}

export default AnalyticsValidation;
