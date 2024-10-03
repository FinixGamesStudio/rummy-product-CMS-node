import * as mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { DAILY_WHEEL_BONUS } from '../../constant';
import { DailyBonus } from './dailyBonus.interface';

const dailyBonusSchema = new mongoose.Schema(
    {
        day: {
            type: Number,
            required: true,
            enum: DAILY_WHEEL_BONUS.DAILY_WHEEL_BONUS_DAYS
        },
        bonus: {
            type: Number,
            required: true,
        },
        dayImage: {
            type: String,
            default : ""
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

dailyBonusSchema.plugin(mongoosePaginate);

const DailyBonusModel = mongoose.model<DailyBonus & mongoose.Document>('DailyBonus', dailyBonusSchema);
export default DailyBonusModel;