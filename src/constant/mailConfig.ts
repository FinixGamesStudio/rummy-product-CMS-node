export = Object.freeze({
  //keval email configuration
  HOST: 'mail.keval.in',
  PORT: 465,
  USER: 'jaiminkumar.hirpara@keval.in',
  PASSWORD: 'keval3692#',

  FROM: 'Game Platform',
  SUPPORT_REPLY_SUBJECT: 'Game platform reply',

  // google gmail configuration
  // HOST: 'smtp.gmail.com',
  // PORT: 465,
  // USER: 'v.naresh.6554@gmail.com',
  // PASSWORD: 'rppotibkovjljzsj',

  // client gmail configuration
  // HOST: '3plusgames.com',
  // PORT: 465,
  // USER: '_mainaccount@3plusgames.com',
  // PASSWORD: 'h!ZKpj9Yu#ZVL5',

  SUPPORT_EMAIL: 'vaibhav@kevalsolutions.com',
  SUPPORT_SUBJECT: 'New Support',

  SES_AWS_ACCESS_KEY_ID: String(process.env.SES_AWS_ACCESS_KEY_ID) || '',
  SES_AWS_SECRET_ACCESS_KEY: String(process.env.SES_AWS_SECRET_ACCESS_KEY) || '',
  SES_AWS_RELIGION: String(process.env.SES_AWS_RELIGION) || 'us-east-1',
  SES_FROM: String(process.env.SES_FROM) || "info@kevalsolutions.com",

  SUBJECT: {
    RESET_PASSWORD: 'Reset Password',
    CHANGE_PASSWORD: 'Change your password'
  }
});
