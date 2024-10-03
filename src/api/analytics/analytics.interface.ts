import { User } from '../user/user.interface';
import { Game } from '../game/game.interface';

export interface Install {
  _id: string;
  userId: User;
  publisherId: User;
  gameId: Game;
}

export interface ExportArray {
  count?: number;
  length: number;
  D1?: number;
  D30?: number;
  D7?: number;
  date?: string;
  DAU?: number;
  gamePlayed?: number;
  GamesperDAU?: number;
  PaidGamesPayingDAU?: number;
  PayingDAU?: number;
}
interface CreatedAt {
  $gte: Date;
  $lt: Date;
}

export interface GetInstalls {
  publisherId?: string;
  gameId?: string;
  createdAt?: CreatedAt;
}

export interface getAllUsersIntalled {
  role?: string;
  createdAt?: CreatedAt;
  isBot?: Boolean;
}