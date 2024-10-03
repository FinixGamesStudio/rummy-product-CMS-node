import * as mongoose from 'mongoose';
import { Game } from './game.interface';
import mongoosePaginate from 'mongoose-paginate-v2';
import { GAME_CONSTANT } from '../../constant';

const gameSchema = new mongoose.Schema(
  {
    publisherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    gameName: {
      type: String,
      required: true,
    },
    description: {
      type: String
    },
    isOrientationPortrait: {
      type: Boolean,
      default: true
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    gameModeOption: {
      type: Boolean,
      default: true
    },
    isNoOfPlayer: {
      type: Boolean,
      default: true
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

gameSchema.plugin(mongoosePaginate);


const GameModel = mongoose.model<Game & mongoose.Document>('Game', gameSchema);
export default GameModel;