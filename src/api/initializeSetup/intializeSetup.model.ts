import * as mongoose from 'mongoose';
import { InitializeSetup } from './initializeSetup.inaterface';
import mongoosePaginate from 'mongoose-paginate-v2';

const initializeSetupSchema = new mongoose.Schema(
    {
        initializeSetup: {
            type: Boolean,
            required: true,
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

initializeSetupSchema.plugin(mongoosePaginate);


const InitializeSetupModel = mongoose.model<InitializeSetup & mongoose.Document>('InitializeSetup', initializeSetupSchema);
export default InitializeSetupModel;
