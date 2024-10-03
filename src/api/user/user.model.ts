import * as mongoose from 'mongoose';
import { User } from '../user/user.interface';
import mongoosePaginate from 'mongoose-paginate-v2';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';
import { TOURNAMENT_CONSTANT, USER_CONSTANT } from '../../constant';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, trim: true },
    phoneNumber: { type: String },
    profileImage: {
      type: String,
    },
    userName: {
      type: String,
      required: true
    },
    nickName: {
      type: String,
    },
    referralCode: {
      type: String,
    },
    deviceId: {
      type: String,
      default: "deviceId",
    },
    isFTUE : {
      type: Boolean,
      default : false,
    },
    deviceType: {
      type: String,
      default: "deviceType",
    },
    address: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "",
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      required: true,
    },
    isBlock: {
      type: Boolean,
      default: false,
    },
    lastActivateAt: {
      type: Date,
      default: Date.now,
    },
    bonus: {
      type: Number,
    },
    winCash: {
      type: Number,
    },
    cash: {
      type: Number,
    },
    coins: {
      type: Number,
    },
    totalDeposits: {
      type: Number,
    },
    totalWithdrawls: {
      type: Number,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    timeZone: {
      type: String,
    },
    isBot: {
      type: Boolean,
      default: false,
    },
    botStatus : {
      type: String,
      enum: [TOURNAMENT_CONSTANT.BOT_STATUS.FREE, TOURNAMENT_CONSTANT.BOT_STATUS.PLAY],
      default: TOURNAMENT_CONSTANT.BOT_STATUS.FREE,
    },
    botTypes : {
      type: String,
      enum: [TOURNAMENT_CONSTANT.BOT_TYPES.USER, TOURNAMENT_CONSTANT.BOT_TYPES.EASY, TOURNAMENT_CONSTANT.BOT_TYPES.MEDIUM, TOURNAMENT_CONSTANT.BOT_TYPES.EXCELLENT],
      default: TOURNAMENT_CONSTANT.BOT_TYPES.USER,
    },
    token: {
      type: String,
    },
    useAvatar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Avatar",
    },
    purchaseAvatars: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Avatar",
    }],
    adminUserPermission: {
      type: Object
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


userSchema.plugin(mongoosePaginate);
userSchema.plugin(aggregatePaginate);

const UserModel = mongoose.model<User & mongoose.Document>('User', userSchema);

export default UserModel;
