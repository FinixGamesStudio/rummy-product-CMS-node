import validate from '../../middleware/validate.middleware';
import { body } from 'express-validator';
import { ERROR_MESSAGES } from '../../constant';

class AvatarValidation {
  createAvatarValidation = () =>
    validate([
      body('avatarName')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'avatarName')
        )
        .isLength({ min: 2 })
        .withMessage(
          ERROR_MESSAGES.COMMON.MIN.replace(
            ':attribute',
            'avatarName'
          ).replace(':min', '2')
        ),
       body('gender')
          .notEmpty()
          .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gender'))
          .isLength({ min: 2 })
          .withMessage(ERROR_MESSAGES.COMMON.MIN.replace(':attribute', 'gender')).replace(':min', '2'),
      body('isFree')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'isFree'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isFree')),
      body('coins')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'coins'))
        .isFloat({ min: 0 })
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'coins')),
    ]);

  updateAvatarValidation = () =>
    validate([
      body('avatarId')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'avatarId')
        )
        .isMongoId()
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'avatarId')
        ),
      body('isImageUpdated')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'isImageUpdated')
        )
        .isBoolean()
        .withMessage(
          ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isImageUpdated')
        ),
      body('avatarName')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'avatarName')
        )
        .isLength({ min: 2 })
        .withMessage(
          ERROR_MESSAGES.COMMON.MIN.replace(
            ':attribute',
            'avatarName'
          ).replace(':min', '2')
        ),
        body('gender')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'gender'))
        .isLength({ min: 2 })
        .withMessage(ERROR_MESSAGES.COMMON.MIN.replace(':attribute', 'gender')).replace(':min', '2'),
      body('isFree')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'isFree'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isFree')),
      body('coins')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'coins'))
        .isFloat({ min: 0 })
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'coins')),
    ]);

  deleteAvatarValidation = () =>
    validate([
      body('avatarId')
        .notEmpty()
        .withMessage(
          ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'avatarId')
        )
        .isMongoId()
        .withMessage(
          ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'avatarId')
        )
    ]);

  getAvatarValidation = () =>
    validate([
      body('start')
        .optional({ nullable: true })
        .matches(/^[0-9]*$/)
        .withMessage(
          ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'start')
        ),
      body('limit')
        .optional({ nullable: true })
        .matches(/^[0-9]*$/)
        .withMessage(
          ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'limit')
        ),
      body('searchText')
        .optional({ nullable: true })
    ]);
}
export default AvatarValidation;
