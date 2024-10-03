export = Object.freeze({
  PLATFORMS_ARRAY: ['Android', 'Ios', 'Cross-Platform'],

  PLATFORMS: {
    android: 'Android',
    ios: 'Ios',
    crossPlatform: 'Cross-Platform'
  },

  GAME_FORMAT_ARRAY: ['Sync', 'Async'],

  GAME_MODE_ARRAY: ['OneVsOne', 'OneVsMany', 'Both'],

  GAME_ENGINE_ARRAY: ['Unity', 'Android'],

  GAME_STATUS: {
    pending: 'Pending',
    approve: 'Approve',
    reject: 'Reject',
    archive: 'Archive'
  },

  GAME_STATUS_ARRAY: ['Pending', 'Approve', 'Reject', 'Archive'],

  ACTIVE_STATUS: {
    active: 'Active',
    deactive: 'Deactive'
  },

  ACTIVE_STATUS_ARRAY: ['Active', 'Deactive'],

  GAME_ICON_EXT_ARRAY: ['.jpeg', '.jpg', '.png'],

  GAME_ICON_FILE_SIZE: 5, // 5 MB,

  GAME_ICON_WIDTH: 512,

  GAME_ICON_HEIGHT: 512,

  GAME_POSTER_EXT_ARRAY: ['.jpeg', '.jpg', '.png'],

  GAME_POSTER_FILE_SIZE: 5, // 5 MB,

  GAME_POSTER_WIDTH: 430,

  GAME_POSTER_HEIGHT: 400,

  RESTRICT_GEO_GAME_TYPE_ARRAY: ['All Games', 'All Games except Card Games', 'No Games'],

  WIN_LOSS_STATUS: {
    pending: 'pending',
    win: 'win',
    loss: 'loss',
    tie: 'tie'
  },

  WIN_LOSS_STATUS_ARRAY: ['pending', 'win', 'loss', 'tie'],

  ENTRY_FEES_PERCENTAGES: {
    winCash: 70,
    cash: 20,
    bonus: 10
  },

  ENTRY_FEES_TYPE_ARRAY: ['Coin'],

  GAME_TAG_ARRAY: ['New Game', 'Popular Game'],

  GAME_TAG: {
    newGame: 'New Game',
    popularGame: 'Popular Game'
  },

  GENRE_CARD: 'Card',

  GAME_CONFIG_KEYS: {
    "PLATFORM_COMMISSION": 0,
    "ENTRY_FEES_PERCENTAGES": {
      "BONUS_COIN": 0
    }
  },

  DEFAULT_GAME_CONFIG: {
    "PLATFORM_COMMISSION": 10,
    "ENTRY_FEES_PERCENTAGES": {
      "BONUS_COIN": 5
    }
  }
});
