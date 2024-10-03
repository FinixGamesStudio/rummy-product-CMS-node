import * as mongoose from 'mongoose';
import { DailyWheelBonus } from './dailyWheelBonus.interface';
import mongoosePaginate from 'mongoose-paginate-v2';
import { DAILY_WHEEL_BONUS } from '../../constant';

const dailyWheelBonusSchema = new mongoose.Schema(
    {
        day: {
            type: Number,
            required: true,
            enum: DAILY_WHEEL_BONUS.DAILY_WHEEL_BONUS_DAYS
        },
        spinTitle: {
            type: String,
            required: true,
        },
        spinDescription: {
            type: String,
        },
        bonusType: {
            type: Array,
            required: true,
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

dailyWheelBonusSchema.plugin(mongoosePaginate);


const DailyWheelBonusModel = mongoose.model<DailyWheelBonus & mongoose.Document>('DailyWheelBonus', dailyWheelBonusSchema);
export default DailyWheelBonusModel;