export interface GameNumberOfPlayer {
    _id: string;
    gameId: string;
    numberOfPlayer: number;
    position: number;
    isDefault: boolean;
    isActive: boolean;
    createAdminId: string;
    updateAdminId?: string;
}