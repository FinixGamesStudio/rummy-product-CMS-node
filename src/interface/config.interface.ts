interface ConfigEnvironment {
  MONGO_SRV: string;
  JWT_SECRET: string;
  PORT: number;
  HTTPS_PORT: number;
  HTTPS_SERVER_CERT_PATH: string;
  HTTPS_SERVER_KEY_PATH: string;
  WINSTON?: WINSTON;
  NODE_ENV: string;
  HTTPS_KEY: any;
  HTTPS_CERT: any;
}

interface WINSTON {
  LEVEL: string;
}

export default ConfigEnvironment;
