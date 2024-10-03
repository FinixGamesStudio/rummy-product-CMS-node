import validate from '../../middleware/validate.middleware';
import { body } from 'express-validator';
import { ERROR_MESSAGES, USER_CONSTANT } from '../../constant';

class AdminUserValidator {
  activeDeactiveRoleCategoryValidate = () =>
    validate([
      body('adminUserRoleId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'adminUserRoleId'))
        .isMongoId()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'adminUserRoleId')),
      body('isActive')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'isActive'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isActive')),
    ]);

  createAdminUserValidate = () =>
    validate([
      body('email')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'email'))
        .matches(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/)
        .withMessage(ERROR_MESSAGES.EMAIL_IS_NOT_PROPER),
      body('fullName')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'fullName'))
        .isLength({ min: 2 })
        .withMessage(ERROR_MESSAGES.COMMON.MIN.replace(':attribute', 'fullName').replace(':min', '2')),
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
      body('permission')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'permission')),
      body('permission.subAdminUser')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'subAdminUser')),
      body('permission.subAdminUser.editor')
        .if(body('permission.subAdminUser').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'subAdminUser.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'subAdminUser.editor')),
      body('permission.subAdminUser.viewer')
        .if(body('permission.subAdminUser').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'subAdminUser.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'subAdminUser.viewer')),
      body('permission.game')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'game')),
      body('permission.game.editor')
        .if(body('permission.game').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'game.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'game.editor')),
      body('permission.game.viewer')
        .if(body('permission.game').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'game.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'game.viewer')),
      body('permission.user')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'user')),
      body('permission.user.editor')
        .if(body('permission.user').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'user.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'user.editor')),
      body('permission.user.viewer')
        .if(body('permission.user').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'user.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'user.viewer')),
      body('permission.analytics')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'analytics')),
      body('permission.analytics.editor')
        .if(body('permission.analytics').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'analytics.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'analytics.editor')),
      body('permission.analytics.viewer')
        .if(body('analytics.analytics').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'analytics.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'analytics.viewer')),
      body('permission.popularGame')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'popularGame')),
      body('permission.popularGame.editor')
        .if(body('permission.popularGame').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'popularGame.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'popularGame.editor')),
      body('permission.popularGame.viewer')
        .if(body('permission.popularGame').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'popularGame.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'popularGame.viewer')),
      body('permission.webSite')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'popularGame')),
      body('permission.webSite.editor')
        .if(body('permission.webSite').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'webSite.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'webSite.editor')),
      body('permission.webSite.viewer')
        .if(body('permission.webSite').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'webSite.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'webSite.viewer')),
      body('permission.bonus')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'popularGame')),
      body('permission.bonus.editor')
        .if(body('permission.bonus').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'bonus.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'bonus.editor')),
      body('permission.bonus.viewer')
        .if(body('permission.bonus').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'bonus.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'bonus.viewer')),
      body('permission.revenue')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'popularGame')),
      body('permission.revenue.editor')
        .if(body('permission.revenue').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'revenue.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'revenue.editor')),
      body('permission.revenue.viewer')
        .if(body('permission.revenue').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'revenue.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'revenue.viewer')),
      body('permission.master')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'popularGame')),
      body('permission.master.editor')
        .if(body('permission.master').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'master.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'master.editor')),
      body('permission.master.viewer')
        .if(body('permission.master').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'master.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'master.viewer')),
      body('permission.setting')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'popularGame')),
      body('permission.setting.editor')
        .if(body('permission.setting').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'setting.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'setting.editor')),
      body('permission.setting.viewer')
        .if(body('permission.setting').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'setting.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'setting.viewer')),
      body('permission.mgpRelease')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'popularGame')),
      body('permission.mgpRelease.editor')
        .if(body('permission.mgpRelease').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'mgpRelease.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'mgpRelease.editor')),
      body('permission.mgpRelease.viewer')
        .if(body('permission.mgpRelease').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'mgpRelease.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'mgpRelease.viewer')),
      body('permission.withdrawal')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'withdrawal')),
      body('permission.withdrawal.editor')
        .if(body('permission.withdrawal').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'withdrawal.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'withdrawal.editor')),
      body('permission.withdrawal.viewer')
        .if(body('analytics.withdrawal').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'withdrawal.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'withdrawal.viewer')),
      body('permission.tdsReport')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'popularGame')),
      body('permission.tdsReport.editor')
        .if(body('permission.tdsReport').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'tdsReport.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'tdsReport.editor')),
      body('permission.tdsReport.viewer')
        .if(body('permission.tdsReport').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'tdsReport.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'tdsReport.viewer')),
      body('permission.helpAndSupport')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'popularGame')),
      body('permission.helpAndSupport.editor')
        .if(body('permission.helpAndSupport').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'helpAndSupport.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'helpAndSupport.editor')),
      body('permission.helpAndSupport.viewer')
        .if(body('permission.helpAndSupport').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'helpAndSupport.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'helpAndSupport.viewer')),
      body('permission.helpAndSupportGame')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'helpAndSupportGame')),
      body('permission.helpAndSupportGame.editor')
        .if(body('permission.helpAndSupportGame').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'helpAndSupportGame.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'helpAndSupportGame.editor')),
      body('permission.helpAndSupportGame.viewer')
        .if(body('permission.helpAndSupportGame').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'helpAndSupportGame.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'helpAndSupportGame.viewer')),
      body('permission.helpAndSupportGame.allowedGames')
        .if(body('permission.helpAndSupportGame').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'helpAndSupportGame.allowedGames'))
        .isArray()
        .withMessage(ERROR_MESSAGES.COMMON.ARRAY.replace(':attribute', 'helpAndSupportGame.allowedGames')),
      body('permission.helpAndSupportTicket')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'helpAndSupportTicket')),
      body('permission.helpAndSupportTicket.editor')
        .if(body('permission.helpAndSupportTicket').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'helpAndSupportTicket.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'helpAndSupportTicket.editor')),
      body('permission.helpAndSupportTicket.viewer')
        .if(body('permission.helpAndSupportTicket').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'helpAndSupportTicket.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'helpAndSupportTicket.viewer')),
      body('permission.helpAndSupportWallet')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'helpAndSupportWallet')),
      body('permission.helpAndSupportWallet.editor')
        .if(body('permission.helpAndSupportWallet').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'helpAndSupportWallet.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'helpAndSupportWallet.editor')),
      body('permission.helpAndSupportWallet.viewer')
        .if(body('permission.helpAndSupportWallet').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'helpAndSupportWallet.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'helpAndSupportWallet.viewer')),
      body('permission.marketing')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'marketing')),
      body('permission.marketing.editor')
        .if(body('permission.marketing').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'marketing.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'marketing.editor')),
      body('permission.marketing.viewer')
        .if(body('permission.marketing').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'marketing.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'marketing.viewer')),
    ]);

  updateAdminUserValidate = () =>
    validate([
      body('adminUserId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'adminUserId'))
        .isMongoId()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'adminUserId')),
      body('fullName')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'fullName'))
        .isLength({ min: 2 })
        .withMessage(ERROR_MESSAGES.COMMON.MIN.replace(':attribute', 'fullName').replace(':min', '2')),
      body('phoneNumber')
        .optional({ nullable: true })
        .matches(/^[0-9]*$/)
        .withMessage(ERROR_MESSAGES.COMMON.NUMERIC.replace(':attribute', 'phoneNumber'))
        .isLength({ max: 10, min: 10 })
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'phoneNumber')),
      body('permission')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'permission')),
      body('permission.subAdminUser')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'subAdminUser')),
      body('permission.subAdminUser.editor')
        .if(body('permission.subAdminUser').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'subAdminUser.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'subAdminUser.editor')),
      body('permission.subAdminUser.viewer')
        .if(body('permission.subAdminUser').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'subAdminUser.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'subAdminUser.viewer')),
      body('permission.game')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'game')),
      body('permission.game.editor')
        .if(body('permission.game').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'game.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'game.editor')),
      body('permission.game.viewer')
        .if(body('permission.game').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'game.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'game.viewer')),
      body('permission.user')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'user')),
      body('permission.user.editor')
        .if(body('permission.user').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'user.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'user.editor')),
      body('permission.user.viewer')
        .if(body('permission.user').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'user.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'user.viewer')),
      body('permission.analytics')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'analytics')),
      body('permission.analytics.editor')
        .if(body('permission.analytics').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'analytics.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'analytics.editor')),
      body('permission.analytics.viewer')
        .if(body('analytics.analytics').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'analytics.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'analytics.viewer')),
      body('permission.popularGame')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'popularGame')),
      body('permission.popularGame.editor')
        .if(body('permission.popularGame').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'popularGame.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'popularGame.editor')),
      body('permission.popularGame.viewer')
        .if(body('permission.popularGame').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'popularGame.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'popularGame.viewer')),
      body('permission.webSite')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'popularGame')),
      body('permission.webSite.editor')
        .if(body('permission.webSite').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'webSite.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'webSite.editor')),
      body('permission.webSite.viewer')
        .if(body('permission.webSite').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'webSite.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'webSite.viewer')),
      body('permission.bonus')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'popularGame')),
      body('permission.bonus.editor')
        .if(body('permission.bonus').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'bonus.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'bonus.editor')),
      body('permission.bonus.viewer')
        .if(body('permission.bonus').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'bonus.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'bonus.viewer')),
      body('permission.revenue')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'popularGame')),
      body('permission.revenue.editor')
        .if(body('permission.revenue').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'revenue.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'revenue.editor')),
      body('permission.revenue.viewer')
        .if(body('permission.revenue').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'revenue.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'revenue.viewer')),
      body('permission.master')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'popularGame')),
      body('permission.master.editor')
        .if(body('permission.master').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'master.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'master.editor')),
      body('permission.master.viewer')
        .if(body('permission.master').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'master.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'master.viewer')),
      body('permission.setting')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'popularGame')),
      body('permission.setting.editor')
        .if(body('permission.setting').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'setting.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'setting.editor')),
      body('permission.setting.viewer')
        .if(body('permission.setting').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'setting.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'setting.viewer')),
      body('permission.mgpRelease')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'popularGame')),
      body('permission.mgpRelease.editor')
        .if(body('permission.mgpRelease').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'mgpRelease.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'mgpRelease.editor')),
      body('permission.mgpRelease.viewer')
        .if(body('permission.mgpRelease').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'mgpRelease.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'mgpRelease.viewer')),
      body('permission.withdrawal')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'withdrawal')),
      body('permission.withdrawal.editor')
        .if(body('permission.withdrawal').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'withdrawal.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'withdrawal.editor')),
      body('permission.withdrawal.viewer')
        .if(body('analytics.withdrawal').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'withdrawal.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'withdrawal.viewer')),
      body('permission.tdsReport')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'popularGame')),
      body('permission.tdsReport.editor')
        .if(body('permission.tdsReport').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'tdsReport.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'tdsReport.editor')),
      body('permission.tdsReport.viewer')
        .if(body('permission.tdsReport').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'tdsReport.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'tdsReport.viewer')),
      body('permission.helpAndSupport')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'popularGame')),
      body('permission.helpAndSupport.editor')
        .if(body('permission.helpAndSupport').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'helpAndSupport.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'helpAndSupport.editor')),
      body('permission.helpAndSupport.viewer')
        .if(body('permission.helpAndSupport').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'helpAndSupport.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'helpAndSupport.viewer')),
      body('permission.helpAndSupportGame')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'helpAndSupportGame')),
      body('permission.helpAndSupportGame.editor')
        .if(body('permission.helpAndSupportGame').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'helpAndSupportGame.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'helpAndSupportGame.editor')),
      body('permission.helpAndSupportGame.viewer')
        .if(body('permission.helpAndSupportGame').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'helpAndSupportGame.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'helpAndSupportGame.viewer')),
      body('permission.helpAndSupportGame.allowedGames')
        .if(body('permission.helpAndSupportGame').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'helpAndSupportGame.allowedGames'))
        .isArray()
        .withMessage(ERROR_MESSAGES.COMMON.ARRAY.replace(':attribute', 'helpAndSupportGame.allowedGames')),
      body('permission.helpAndSupportTicket')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'helpAndSupportTicket')),
      body('permission.helpAndSupportTicket.editor')
        .if(body('permission.helpAndSupportTicket').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'helpAndSupportTicket.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'helpAndSupportTicket.editor')),
      body('permission.helpAndSupportTicket.viewer')
        .if(body('permission.helpAndSupportTicket').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'helpAndSupportTicket.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'helpAndSupportTicket.viewer')),
      body('permission.helpAndSupportWallet')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'helpAndSupportWallet')),
      body('permission.helpAndSupportWallet.editor')
        .if(body('permission.helpAndSupportWallet').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'helpAndSupportWallet.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'helpAndSupportWallet.editor')),
      body('permission.helpAndSupportWallet.viewer')
        .if(body('permission.helpAndSupportWallet').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'helpAndSupportWallet.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'helpAndSupportWallet.viewer')),
       body('permission.marketing')
        .optional({ nullable: true })
        .isObject()
        .withMessage(ERROR_MESSAGES.COMMON.OBJECT.replace(':attribute', 'marketing')),
      body('permission.marketing.editor')
        .if(body('permission.marketing').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'marketing.editor'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'marketing.editor')),
      body('permission.marketing.viewer')
        .if(body('permission.marketing').exists({ checkFalsy: true }))
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'marketing.viewer'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'marketing.viewer')),
    ]);

  getAdminUsersValidate = () =>
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

  getAgentPermissionValidate = () =>
    validate([
      body('role')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'role'))
        .custom(async (value) => {
          const lowercaseValue = value.toLowerCase();
          const capitilizeValue = lowercaseValue.charAt(0).toUpperCase() + lowercaseValue.slice(1);

          if (USER_CONSTANT.ROLES_ARRAY.includes(capitilizeValue)) {
            return Promise.reject(
              ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'role')
            );
          } else {
            return Promise.resolve();
          }
        })
    ]);

  blockUnblockAdminUserValidate = () =>
    validate([
      body('adminUserId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'adminUserId'))
        .isMongoId()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'adminUserId')),
      body('isBlock')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'isBlock'))
        .isBoolean()
        .withMessage(ERROR_MESSAGES.COMMON.BOOLEAN.replace(':attribute', 'isBlock')),
    ]);

  deleteAdminUserValidate = () =>
    validate([
      body('adminUserId')
        .notEmpty()
        .withMessage(ERROR_MESSAGES.COMMON.REQUIRED.replace(':attribute', 'adminUserId'))
        .isMongoId()
        .withMessage(ERROR_MESSAGES.COMMON.INVALID.replace(':attribute', 'adminUserId'))
    ]);

}

export default AdminUserValidator;