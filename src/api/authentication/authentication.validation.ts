import { body } from 'express-validator';
import validate from '../../middleware/validate.middleware';
import { ERROR_MESSAGES, COUNTRY_CONSTANT } from '../../constant';
import USER_CONSTANT from '../../constant/userConstant';

class AuthenticationValidation {
  registrationValidation = () =>
    validate([
      body('email')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'email'))
        .matches(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/)
        .withMessage(ERROR_MESSAGES.EMAIL_IS_NOT_PROPER),
      body('fullName')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'fullName')),
      body('password')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'password'))
        .isLength({ min: 8 })
        .withMessage(ERROR_MESSAGES.PASSWORD_MUST_BE_8_CHARACTERS),
      body('role')
        .isIn(USER_CONSTANT.ROLES_ARRAY)
        .withMessage(ERROR_MESSAGES.COMMON.IN.replace(':attribute', 'role')
          .replace(':values', '[Admin, Publisher, User]')),
      // body('phoneNumber')
      //   .if(body('phoneNumber').equals(USER_CONSTANT.ROLES.user))
      //   .notEmpty()
      //   .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'phoneNumber'))
      //   .matches(/^[0-9]*$/)
      //   .withMessage(
      //     ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'phoneNumber')
      //   )
      //   .isLength({ max: 10, min: 10 })
      //   .withMessage(
      //     ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'phoneNumber')
      //   ),
      // body('country')
      //   .optional({ nullable: true }),
      // body('deviceType')
      //   .if(body('role').equals(USER_CONSTANT.ROLES.user))
      //   .notEmpty()
      //   .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'deviceType'))
      //   .isIn(USER_CONSTANT.DEVICE_TYPE_ARRAY)
      //   .withMessage(ERROR_MESSAGES.COMMON.IN.replace(':attribute', 'deviceType')
      //     .replace(':values', '[android, ios]')),
    ]);

  loginValidation = () =>
    validate([
      body('email')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'email'))
        .matches(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/)
        .withMessage(ERROR_MESSAGES.EMAIL_IS_NOT_PROPER),
      body('password')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'password'))
    ]);

  forgotPasswordValidation = () =>
    validate([
      body('email')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'email'))
        .matches(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/)
        .withMessage(ERROR_MESSAGES.EMAIL_IS_NOT_PROPER)
    ]);

  resetPasswordValidation = () =>
    validate([
      body('email')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'email'))
        .matches(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/)
        .withMessage(ERROR_MESSAGES.EMAIL_IS_NOT_PROPER),
      body('resetToken')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'resetToken')),
      body('password')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'password'))
        .isLength({ min: 8 })
        .withMessage(ERROR_MESSAGES.PASSWORD_MUST_BE_8_CHARACTERS)
    ]);

  changePasswordValidation = () =>
    validate([
      body('oldPassword')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'oldPassword')
        ),
      body('password')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'password')
        )
        .isLength({ min: 8 })
        .withMessage(ERROR_MESSAGES.PASSWORD_MUST_BE_8_CHARACTERS)
    ]);

  registerPublisherValidation = () =>
    validate([
      body('email')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'email'))
        .matches(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/)
        .withMessage(ERROR_MESSAGES.EMAIL_IS_NOT_PROPER),
      body('password')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'password'))
        .isLength({ min: 8 })
        .withMessage(ERROR_MESSAGES.PASSWORD_MUST_BE_8_CHARACTERS),
      body('phoneNumber')
        .optional({ nullable: true })
        .matches(/^[0-9]*$/)
        .withMessage(
          ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'phoneNumber')
        )
        .isLength({ max: 10, min: 10 })
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'phoneNumber')
        ),
      body('country')
        .optional({ nullable: true })
    ]);

  sendOtpValidation = () =>
    validate([
      body('phoneNumber')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'phoneNumber'))
        .matches(/^[0-9]*$/)
        .withMessage(
          ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'phoneNumber')
        )
        .isLength({ max: 10, min: 10 })
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'phoneNumber')
        ),
      body('isoCode')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'isoCode'))
        .isIn(COUNTRY_CONSTANT.VALID_COUNTRY_CODES)
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'isoCode')),
    ]);

  verifyOtpValidation = () =>
    validate([
      body('phoneNumber')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'phoneNumber'))
        .matches(/^[0-9]*$/)
        .withMessage(
          ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'phoneNumber')
        )
        .isLength({ max: 10, min: 10 })
        .withMessage(
          ERROR_MESSAGES.COMMON.EXACT.replace(':attribute', 'phoneNumber').replace(':value', '10 digits')
        ),
      body('isoCode')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'isoCode'))
        .isIn(COUNTRY_CONSTANT.VALID_COUNTRY_CODES)
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'isoCode')),
      body('deviceType')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'deviceType'))
        .isIn(USER_CONSTANT.DEVICE_TYPE_ARRAY)
        .withMessage(ERROR_MESSAGES.COMMON.IN.replace(':attribute', 'deviceType')
          .replace(':values', '[Android, Ios]')),
      body('otp')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'otp'))
        .matches(/^[0-9]*$/)
        .withMessage(
          ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'otp')
        ),
      body('referralCode')
        .optional({ nullable: true }),
      body('ipAddress')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'ipAddress')),
      body('deviceId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'deviceId')),
      body('notificationToken')
        .optional({ nullable: true }),
    ]);

  checkPhoneNumberValidation = () =>
    validate([
      body('phoneNumber')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'phoneNumber'))
        .matches(/^[0-9]*$/)
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'phoneNumber')),
      body('isoCode')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'isoCode'))
        .isIn(COUNTRY_CONSTANT.VALID_COUNTRY_CODES)
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'isoCode')),
    ]);
}

export default AuthenticationValidation;
