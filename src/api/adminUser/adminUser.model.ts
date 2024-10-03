import * as mongoose from 'mongoose';
import { AdminUserRole } from './adminUser.interface';
import mongoosePaginate from 'mongoose-paginate-v2';

const adminUserRoleSchema = new mongoose.Schema(
  {
    adminUserRoleName: {
      type: String,
      required: true
    },
    permission: {
      type: Object
    },
    isActive: {
      type: Boolean,
      default: true
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

adminUserRoleSchema.plugin(mongoosePaginate);

const AdminUserRoleModel = mongoose.model<AdminUserRole & mongoose.Document>('AdminUserRole', adminUserRoleSchema);

export default AdminUserRoleModel;
