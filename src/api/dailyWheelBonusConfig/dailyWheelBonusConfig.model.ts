import * as mongoose from 'mongoose';
import { dailyWheelBonusConfig } from './dailyWheelBonusConfig.interface';
import mongoosePaginate from 'mongoose-paginate-v2';
import { DAILY_WHEEL_BONUS } from '../../constant';

const dailyWheelBonusConfigSchema = new mongoose.Schema(
    {
        rows: {
            type: Number,
            required: true,
            enum: DAILY_WHEEL_BONUS.DAILY_WHEEL_BONUS_ROWS
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

dailyWheelBonusConfigSchema.plugin(mongoosePaginate);


const dailyWheelBonusConfigModel = mongoose.model<dailyWheelBonusConfig & mongoose.Document>('dailyWheelBonusConfig', dailyWheelBonusConfigSchema);
export default dailyWheelBonusConfigModel;