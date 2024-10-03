export interface UpdateBotData {
    profileImage?: string;
    profileImageKey?: string;
    role?: string;
    bonus?: string;
    cash?: string;
    initialCash?: number;
    
    coins? : number;
    isBot?: boolean;
    fullName?: string;
    updateAdminId?: string;
}
export interface bot_Name {
    _id: string;
    name: string;
  }