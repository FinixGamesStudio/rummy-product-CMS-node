import * as mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { LobbyType } from './lobbyType.Interface';

const lobbyTypeSchema = new mongoose.Schema(
    {
        lobbyType: {
            type: String,
            required: true
        },
        type: {
            type: String,
            require: true
        },
        lobbyTypeIcon: {
            type: String,
            required: true
        },
        lobbyTypeIconKey: {
            type: String,
            required: true
        },
        description: {
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

lobbyTypeSchema.plugin(mongoosePaginate);


const lobbyTypeModel = mongoose.model<LobbyType & mongoose.Document>('LobbyType', lobbyTypeSchema);

export default lobbyTypeModel;