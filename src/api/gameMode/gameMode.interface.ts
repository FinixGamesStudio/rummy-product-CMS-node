export interface GameMode {
  _id: string;
  gameId: string;
  gameModeName: string;
  gameTypeName: string;
  gameModeIcon?: string;
  position: number;
  createAdminId: string;
  updateAdminId?: string;
}
