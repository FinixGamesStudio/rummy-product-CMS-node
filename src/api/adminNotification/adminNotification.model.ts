import * as mongoose from 'mongoose';
import { AdminNotification } from './adminNotification.interface';
import mongoosePaginate from 'mongoose-paginate-v2';

const adminNotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: true
    },
    notificationTitle: {
      type: String,
      required: true
    },
    notificationDescription: {
      type: String
    },
    notificationCategory: {
      type: String,
      required: true
    },
    notificationData: {
      reportedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      blockedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      helpAndSupportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HelpAndSupport'
      },
      userKycPanCardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserKYCPanCard'
      },
      userKyAadharCardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserKYCAadharCard'
      },
      withdrawManuallyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'withdrawManually'
      },
      addDepositManuallyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AddDepositCash'
      },
      kycType: {
        type: String
      },
      data: {
        type: Object,
      }
    },
    isRead: {
      type: Boolean,
      required: true,
    },
    readAt: {
      type: Date
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

adminNotificationSchema.plugin(mongoosePaginate);

const AdminNotificationModel = mongoose.model<AdminNotification & mongoose.Document>(
  'AdminNotification',
  adminNotificationSchema
);

export default AdminNotificationModel;
