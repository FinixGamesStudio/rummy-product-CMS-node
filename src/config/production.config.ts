import ConfigEnvironment from '../interface/config.interface';

const PRODUCTION = (): ConfigEnvironment => {
  const {
    // * http
    PORT,
    HTTPS_PORT,
    HTTPS_SERVER_CERT_PATH,
    HTTPS_SERVER_KEY_PATH,

    MONGO_SRV,
    JWT_SECRET,
    NODE_ENV,
    // * winston
    LOG_ERROR_LEVEL,
    HTTPS_KEY,
    HTTPS_CERT
  } = process.env;

  return {
    NODE_ENV: NODE_ENV ? NODE_ENV : 'production',
    // * DB CONFIG
    MONGO_SRV: MONGO_SRV ? MONGO_SRV : '',

    // *JWT SECRET
    JWT_SECRET: JWT_SECRET ? JWT_SECRET : '',
    // * WINSTON DB CONFIG
    WINSTON: {
      LEVEL: LOG_ERROR_LEVEL ? LOG_ERROR_LEVEL : 'error'
    },

    // * DB CONFIG

    // * SERVER CONFIG
    PORT: PORT ? Number(PORT) : 5000,
    HTTPS_PORT: HTTPS_PORT ? Number(HTTPS_PORT) : 8000,
    HTTPS_SERVER_CERT_PATH: HTTPS_SERVER_CERT_PATH
      ? HTTPS_SERVER_CERT_PATH
      : '',
    HTTPS_SERVER_KEY_PATH: HTTPS_SERVER_KEY_PATH ? HTTPS_SERVER_KEY_PATH : '',
    HTTPS_KEY: HTTPS_KEY || '',
    HTTPS_CERT: HTTPS_CERT || ''
  };
};

export default PRODUCTION;
