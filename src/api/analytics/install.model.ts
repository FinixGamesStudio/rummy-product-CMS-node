import * as mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { Install } from './analytics.interface';

const installSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    publisherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
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

installSchema.plugin(mongoosePaginate);

const InstallModel = mongoose.model<Install & mongoose.Document>(
  'Install',
  installSchema
);

export default InstallModel;
