import TokenData from '../../interface/tokenData.interface';

export interface User {
  _id: string;
  name:string;
  email: string;
  role: string;
  password?: string;
  isBlock?: boolean;
  lastActivateAt?: Date;
  phoneNumber?: string;
  bonus?: number;
  winCash?: number;
  cash?: number;
  address?: string;
  state?: string;
  country?: string;
  deviceType?: string;
  totalEarnings?: number;
  timeZone?: string;
  profileImage?: string;
  userName: string;
  coins: number;
  nickName?: string;
  referralCode: string;
  totalDeposits: number;
  totalWithdrawls: number;
  deviceId: string;
  isBot?: boolean;
  isFTUE: boolean;
  botStatus : string;
  botTypes : string;
  token?: string;
  useAvatar: string;
  purchaseAvatars: string[];
  adminUserPermission: any;
}

export interface UserRequest {
  email: string;
  password: string;
  role: string;
  country?: string;
  phoneNumber?: number;
  deviceType?: string;
  userName?: string;
  adminUserPermission?: any
}

export interface Register {
  tokenData?: TokenData;
  user?: User;
  already?: boolean;
}

interface CreatedAt {
  $gte: Date;
  $lte: Date;
}

export interface GetAllUsers {
  role?: string;
  createdAt?: CreatedAt;
  $or?: any;
  isBlock?: Boolean;
  state?: string;
  isBot?: Boolean;
}

export interface GetPublisherByStatus {
  role?: string;
  publisherStatus?: string;
  createdAt?: CreatedAt;
  $or?: any;
}


export interface UpdateUserPersonalInfo {
  title?: string;
  email?: string;
  phoneNumber?: number;
  bonus?: number;
  coins?: number;
  address?: string;
  country?: string;
  profileImage?: string;
  profileImageKey?: string;
  userName?: string;
  nickName?: string;
  isAvatarAsProfileImage?: boolean;
  updateAdminId?: string
}

export interface UserCoinBonus {
  _id?: string;
  bonus: number;
  coins: number;
}