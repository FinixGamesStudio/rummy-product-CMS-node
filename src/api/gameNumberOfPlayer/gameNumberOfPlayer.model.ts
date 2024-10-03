import * as mongoose from 'mongoose';
import { GameNumberOfPlayer } from './gameNumberOfPlayer.interface';
import mongoosePaginate from 'mongoose-paginate-v2';

const gameNumberOfPlayerSchema = new mongoose.Schema(
    {
        gameId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game',
            index: true
        },
        numberOfPlayer: {
            type: Number,
            require: true
        },
        position: {
            type: Number
        },
        isDefault: {
            type: Boolean,
            default: false
        },
        isActive: {
            type: Boolean,
            default: true
        },
        createAdminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        updateAdminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
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

gameNumberOfPlayerSchema.plugin(mongoosePaginate);



const GameNumberOfPlayerModel = mongoose.model<GameNumberOfPlayer & mongoose.Document>('GameNumberOfPlayer', gameNumberOfPlayerSchema);
export default GameNumberOfPlayerModel;