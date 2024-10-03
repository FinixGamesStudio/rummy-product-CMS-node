import { Game } from "../game/game.interface";
import { User } from "../user/user.interface";

interface CreatedAt {
  $gte: Date;
  $lt: Date;
}

export interface GetHeadToHeads {
  eventType: string;
  gameId?: string;
  createdAt?: CreatedAt;
  noOfPlayer?: string,
  isCash?:boolean,
  isGameModeOption?: boolean;
  gameModeId?: string;
  $or?: any;
  entryfee?: number;
}

export interface UpdateHeadToHead {
  tournamentName?: string;
  description?: string;
  entryfee?: number;
  isGameModeOption?: boolean;
  gameModeId?: string;
  isCash?: boolean;
  isUseBot?: boolean;
  lobbyType?: string;
  minPlayer?: number;
  maxPlayer?: number;
  noOfPlayer?: number;
  isDummyPlayer?: boolean;
  winningPrice?: number;
  updateAdminId?: string;
}

export interface HeadToHead {
    _id: string;
    publisherId: User;
    gameId: Game
    tournamentName?: string;
    description?: string;
    eventType: string;
    entryfee: number;
    isGameModeOption: boolean;
    isDummyPlayer?: boolean;
    gameModeId?: string;
    gameModeName?: string;
    isCash?: boolean;
    gameType?:string
    isUseBot: boolean;
    isActive: boolean;
    lobbyType?: string;
    minPlayer?: number;
    maxPlayer?: number;
    noOfPlayer?: number;
    noOfDecks?: number;
    winningPrice: number;
    createAdminId: string;
    isAutoSplit?: boolean;
    updateAdminId?: string;
  }

  export interface CreateHeadToHeads {
    publisherId?: User;
    gameId?: Game
    tournamentName?: string;
    description?: string;
    eventType?: string;
    entryfee?: number;
    isGameModeOption?: boolean;
    gameModeId?: string;
    gameModeName?: string;
    isCash?: boolean;
    gameType?:string
    isUseBot?: boolean;
    isActive?: boolean;
    lobbyType?: string;
    minPlayer?: number;
    maxPlayer?: number;
    noOfPlayer?: number;
    noOfDecks?: number;
    isDummyPlayer?: boolean;
    winningPrice?: number;
    isAutoSplit?: boolean;
    createAdminId?: string;
    updateAdminId?: string;
  }