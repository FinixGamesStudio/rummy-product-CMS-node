import * as mongoose from 'mongoose';
import { bot_Name } from './bot.interface';

const botNameSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      getters: true
    }
  }
);

const BotNameModel = mongoose.model<bot_Name & mongoose.Document>(
  'bot_name',
  botNameSchema
);

export default BotNameModel;

