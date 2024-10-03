import * as mongoose from 'mongoose';
import { Offer } from './offer.interface';
import mongoosePaginate from 'mongoose-paginate-v2';

const offerSchema = new mongoose.Schema(
    {
        offerName: {
            type: String,
            required: true,
        },
        offerDescription: {
            type: String,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        offerPrice: {
            type: Number,
            required: true,
        },
        offerChips: {
            type: Number,
            required: true,
        },
        packageId: {
            type: String,
            require: true
        },
        offerBannerImage: {
            type: String,
            required: true
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

offerSchema.plugin(mongoosePaginate);


const OfferModel = mongoose.model<Offer & mongoose.Document>('Offer', offerSchema);
export default OfferModel;