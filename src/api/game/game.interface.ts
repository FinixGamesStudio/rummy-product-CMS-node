import { User } from '../user/user.interface';

export interface Game {
  _id: string;
  publisherId: User;
  gameName: string;
  description: string;
  isOrientationPortrait?: boolean;
  isVerified?: boolean;
  isActive?: boolean;
  isGameModeOption: boolean;
  isNoOfPlayer: boolean;
  createAdminId: string;
  updateAdminId?: string;
}
  