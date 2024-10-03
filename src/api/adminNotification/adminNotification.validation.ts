import validate from '../../middleware/validate.middleware';
import { body } from 'express-validator';
import { ERROR_MESSAGES, USER_CONSTANT } from '../../constant';

class AdminNotificationValidator {
  getNotificationsValidation = () =>
    validate([
      body('start')
        .optional({ nullable: true })
        .matches(/^[0-9]*$/)
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'start')),
      body('limit')
        .optional({ nullable: true })
        .matches(/^[0-9]*$/)
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'limit'))
    ])

  markAsReadNotificationValidation = () =>
    validate([
      body('adminNotificationId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'adminNotificationId'))
        .isMongoId()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'adminNotificationId'))
    ])
}

export default AdminNotificationValidator;