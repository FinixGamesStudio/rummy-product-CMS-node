export = Object.freeze({
    EMAIL: 'vaibhav@kevalsolutions.com',
    PASSWORD: 'keval@123',
    FULLNAME: 'Admin',
    IS_BLOCK: false,
    IS_AVATAR_AS_PROFILE_IMAGE: false,

    PAYOUT_METHOD: {
        bank_account: 'bank_account',
        vpa: 'vpa'
    },

    ROLES: {
        admin: 'Admin',
        publisher: 'Publisher',
        user: 'User'
    },

    UPLOADS_PATH: '../../../../src/uploads',

    FAQ_TYPE: [
        'Game'
    ],

    FAQ: [
        {
            FAQType: 'Game',
            question: 'How important are games?',
            answer: 'The popularity of smart gadgets like smartphones, tablets etc has opened up a new avenue of entertainment in the software industry and that is the domain of Mobile gaming sector. And now games market is a big part of mobile ecosystem and is estimated to reach $14.4 billion by 2017.'

        },
        {
            FAQType: 'Game',
            question: 'Which are the gaming platforms available?',
            answer: 'Different smart gadgets are running on different operating systems or platforms and the popular ones are Smartphone: Apple iOS, Android,'
        }
    ],

    SETTING_CONFIG: {
        SIGNUP_CASH: 100,
        SIGNUP_BONUS: 1000,
        MINIMUM_ADD_CASH: 20,
        MINIMUM_WITHDRAW_CASH: 1500
    },

    HELP_TICKET_TYPES: ['Management', 'Wallet', 'Games']

})