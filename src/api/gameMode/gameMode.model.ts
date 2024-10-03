import * as mongoose from 'mongoose';
import { GameMode } from './gameMode.interface';
import mongoosePaginate from 'mongoose-paginate-v2';

const gameModeSchema = new mongoose.Schema(
  {
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: true
    },
    gameModeName: {
      type: String,
      required: true
    },
    gameTypeName: {
      type: String,
      required: true
    },
    gameModeIcon: {
      type: String
    },
    position: {
      type: Number
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

gameModeSchema.plugin(mongoosePaginate);

const GameModeModel = mongoose.model<GameMode & mongoose.Document>(
  'GameMode',
  gameModeSchema
);

export default GameModeModel;
