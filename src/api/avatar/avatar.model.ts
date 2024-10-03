import * as mongoose from 'mongoose';
import { Avatar } from './avatar.interface';
import mongoosePaginate from 'mongoose-paginate-v2';

const avatarSchema = new mongoose.Schema(
  {
    avatarName: {
      type: String,
      required: true,
      index: true
    },
    gender: {
      type: String,
      required: true,
    },
    avatarImage: {
      type: String,
      required: true
    },
    isFree : {
      type: Boolean,
      required: true
    },
    coins : {
      type: Number,
    }
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

avatarSchema.plugin(mongoosePaginate);

const AvatarModel = mongoose.model<Avatar & mongoose.Document>(
  'Avatar',
  avatarSchema
);

export default AvatarModel;
