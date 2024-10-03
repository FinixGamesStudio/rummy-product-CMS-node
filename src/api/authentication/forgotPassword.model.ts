import * as mongoose from 'mongoose';
import { ForgotPassword } from './authentication.interface';
import mongoosePaginate from 'mongoose-paginate-v2';

const forgotPasswordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    resetToken: {
      type: String,
      required: true
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

forgotPasswordSchema.plugin(mongoosePaginate);

const ForgotPasswordModel = mongoose.model<ForgotPassword & mongoose.Document>(
  'ForgotPassword',
  forgotPasswordSchema
);

export default ForgotPasswordModel;
