import * as mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';
import { playedGames } from './playedGames.interface';


const playedGamesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      win:{
        type: Number,
        default:0
      },
      loss:{
        type: Number,
        default:0
      },
      tie:{
        type: Number,
        default:0
      }
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

playedGamesSchema.plugin(mongoosePaginate);
playedGamesSchema.plugin(aggregatePaginate);


const playedGamesModel = mongoose.model<playedGames & mongoose.Document>('playedGames', playedGamesSchema);


export default playedGamesModel;