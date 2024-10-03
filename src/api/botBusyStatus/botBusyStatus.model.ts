import * as mongoose from 'mongoose';
import { BotBusyStatus } from './botBusyStatus.interface';
import mongoosePaginate from 'mongoose-paginate-v2';

const botBusyStatusSchema = new mongoose.Schema(
  {
    botUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HeadToHead',
      index: true
    },
    numericId: { 
      type: Number,
      default: 0
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

botBusyStatusSchema.plugin(mongoosePaginate);

botBusyStatusSchema.pre('save', async function(next) {
  const maxNumber = await BotBusyStatusModel.findOne().sort({"numericId": -1});
  let maxNumberId = 1;

  if(maxNumber && maxNumber.numericId) {
    maxNumberId = maxNumber.numericId + 1;
  }
  
  const doc = this;
  doc.numericId = maxNumberId;
 
  next();
});


const BotBusyStatusModel = mongoose.model<BotBusyStatus & mongoose.Document>(
  'BotBusyStatus',
  botBusyStatusSchema
);

export default BotBusyStatusModel;
