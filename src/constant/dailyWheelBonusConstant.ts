export = Object.freeze({
    DAILY_WHEEL_BONUS_DAYS: [1, 2, 3, 4, 5, 6, 7],

    NUMBER_OF_BONUS_PARTITION: 3, // cash = 3, coins = 3, betterLuckNextTime = 2 (3*2) + 2 = 8

    NO_OF_HARD_LUCK: 2,

    NO_OF_BOOSTER: 2,
    BOOSTER_POSITION_1: 0,
    BOOSTER_POSITION_2: 4,

    WHEEL_PARTITION_TYPE: {
        cash: 'Cash',
        bonus: 'Bonus',
        hardLuck: 'HardLuck',
    },

    WHEEL_LABEL: {
        cash: 'Deposit Cash',
        bonus: 'Bonus',
        hardLuck: 'Hard Luck',
        referralBooster: 'Referral Booster',
    },

    WHEEL_PARTITION_ARRAY: ['Cash', 'Bonus', 'HardLuck'],

    DAILY_WHEEL_BONUS_REAL_MONEY_TYPE_ARRAY: ['Cash'],

    DAILY_WHEEL_BONUS_REAL_MONEY_TYPE_OBJ: {
        cash: 'Cash',
    },

    NO_OF_DAYS_AFTER_REGISTER: 1,

    DAILY_WHEEL_BONUS_ROWS: [2, 4, 6, 8],

    DAILY_WHEEL_BONUS_TYPES_ARRAY: [
        'Bonus Coin',
        'Referral Boosters',
        'Add Coin Offer',
        'Hard Luck'
    ],

    DAILY_WHEEL_BONUS_TYPE: {
        bonusCoinAmount: 'Bonus Coin',
        referralBoosters: 'Referral Boosters',
        addCoinOffer: 'Add Coin Offer',
        hardLuck: 'Hard Luck'
    },

    DAILY_WHEEL_BONUS_DAY: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ]

});