export = Object.freeze({
  TOURNAMENT_TYPE_ARRAY: ['Synchronous', 'Asynchronous'],

  REPEAT_UNIT_ARRAY: ['Days', 'Weeks', 'Months'],
  TOURNAMENT_STATUS_ARRAY: ['Upcoming', 'Running', 'Completed', 'Cancelled'],
  TOURNAMENT_STATUS: {
    'upcoming': 'Upcoming',
    'running': 'Running',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  },

  COVER_IMAGE_EXT_ARRAY: ['.jpeg', '.jpg', '.png'],

  COVER_IMAGE_FILE_SIZE: 5, // 5 MB

  MONEY_MODE_ARRAY: ['Real Money', 'Coin', 'Free'],

  MONEY_MODE: {
    realMoney: 'Real Money',
    coin: 'Coin',
    free: 'Free'
  },

  BOT_STATUS : {
    FREE : "free",
    PLAY : "play",
  },

  BOT_TYPES : {
    USER : "user",
    EASY : "easy",
    MEDIUM : "medium",
    EXCELLENT : "excellent"
  },

  EVENT_TYPE: {
    headToHead: 'HeadToHead'
  },

  EVENT_TYPE_ARRAY: ['HeadToHead'],

  DEFAULT_ACTIVE_STATUS: true,

  LOBBY_TYPE_ARRAY: ['HeadToHead', 'Contest'],

  LOBBY_TYPE: {
    headToHead: 'HeadToHead',
    contest: 'Contest'
  },

  H2H_MIN_PLAYERS: 2,

  H2H_MAX_PLAYERS: 2,

  POINTS_GAME_MODE: 'Points',

  POKER_GAME_MODE: 'Poker',

  LEADERBOARD_RANK_CONFIG: {
    LUDO_GAME: {
      GAME_NAME: 'Ludo',
      NO_OF_PLAYER: 4
    },
  }
});
