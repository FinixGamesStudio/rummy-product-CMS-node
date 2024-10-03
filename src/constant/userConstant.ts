export = Object.freeze({
  ROLES: {
    admin: 'Admin',
    publisher: 'Publisher',
    user: 'User',
    // adminUser: 'Admin',
    adminUser: 'AdminUser',
    subAdminUser: 'SubAdminUser'
  },

  PUBLISHER_STATUS: {
    pending: 'pending',
    approve: 'approve',
    reject: 'reject'
  },

  ROLES_ARRAY: ['Admin', 'Publisher', 'User'],

  AGENT_ROLES_ARRAY: ['AdminUser', 'SubAdminUser'],

  PUBLISHER_STATUS_ARRAY: ['pending', 'approve', 'reject'],

  DEFAULT_COINS: 1000,

  DEFAULT_BONUS: 1000,

  DEVICE_TYPE_ARRAY: ['Android', 'Ios'],

  DEFAULT_PUBLISHER_EARNINGS: 1000,

  PREFERENCE_KEY_ARRAY: ['isReceivePromotions', 'isUseCookie'],

  DEFAULT_PLATFORM_FEE: 10,

  PROFILE_IMAGE_EXT_ARRAY: ['.jpeg', '.jpg', '.png'],

  PROFILE_IMAGE_FILE_SIZE: 5, // 5 MB

  DEFAULT_VIRTUAL_MONEY_COINS: 1000,

  SIGNUP_COIN: 0,
  SIGNUP_BONUS: 0,
  SIGNUP_CASH: 0,

  BOT_DEFAULT: {
    LONGITUDE: '0',
    LATITUDE: '0',
    WIN_CASH: '0',
  },

  USER_DELETE_ACCOUNT_DAYS: 15
});
