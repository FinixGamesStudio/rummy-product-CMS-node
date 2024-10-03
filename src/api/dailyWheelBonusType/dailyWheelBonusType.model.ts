import * as mongoose from 'mongoose';
import { DailyWheelBonusType } from './dailyWheelBonusType.interface';
import mongoosePaginate from 'mongoose-paginate-v2';

const dailyWheelBonusTypeSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true
        },
        title: {
            type: String
        },
        description: {
            type: String
        },
        dailyWheelBonusIcon: {
            type: String
        },
        dailyWheelBonusIconKey: {
            type: String
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
)

dailyWheelBonusTypeSchema.plugin(mongoosePaginate);


const dailyWheelBonusTypeModel = mongoose.model<DailyWheelBonusType & mongoose.Document>('DailyWheelBonusType', dailyWheelBonusTypeSchema);
export default dailyWheelBonusTypeModel;