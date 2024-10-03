import * as mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2"
import tournamentConstant from "../../constant/tournamentConstant";
import { HeadToHead } from "./headToHead.Interface";

const headToHeadSchema = new mongoose.Schema(
   {
    tournamentName: {
        type: String,
        trim: true,
    },
    publisherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Game",
        required: true,
        index: true,
    },
    description: {
        type: String,
        trim: true,
    },
    eventType: {
        type: String,
        required: true,
        enum: tournamentConstant.EVENT_TYPE_ARRAY,
    },
    entryfee: {
        type: Number,
        required: true,
    },
    gameModeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GameMode",
    },
    isCash: {
        type: Boolean,
        default: false,
    },
    isUseBot: {
        type: Boolean,
        required: true,
    },
    isActive: {
        type: Boolean,
        required: true,
    },
    minPlayer: {
        type: Number,
    },
    maxPlayer: {
        type: Number,
    },
    lobbyType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LobbyType",
        required: true,
    },
    noOfPlayer: {
        type: Number,
    },
    isDummyPlayer: {
        type: Boolean,
        required: true,
    },
    winningPrice: {
        type: Number,
        required: true,
    },
    gameType:{
        type:String,
        // required: true,
      },
    createAdminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    updateAdminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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
headToHeadSchema.plugin(mongoosePaginate);

const HeadToHeadModel = mongoose.model<HeadToHead & mongoose.Document>(
    'HeadToHead',
    headToHeadSchema
);
export default HeadToHeadModel;