import { connect, ConnectOptions, set } from 'mongoose';
import getconfig from '../config';
import Logger from '../logger';

class MongoBot {
  async init(): Promise<void> {
    try {
      const { MONGO_SRV } = getconfig();
      set('strictQuery', false);
      await connect(MONGO_SRV, {
        useUnifiedTopology: true 
      } as ConnectOptions);
      // set('debug', true);
      Logger.info('MongoDB Connected...');
    } catch (err) {
      Logger.error(err); 
      process.exit(0);
    }
  }
}

export default new MongoBot();