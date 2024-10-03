export interface PermissionCategory {
  viewer: boolean,
  editor: boolean
}

export interface AdminUserPermission {
  allAccess?: boolean;
  viewAnalytics?: boolean;
  approveRejectUserWithdrawls?: boolean;
  approveRejectPublisherWithdrawls?: boolean;
  approveRejectGamesAndPublishers?: boolean;
  addRemoveAdminUsers?: boolean;
  usersList?: boolean;
  reportedUsersList?: boolean;
  bloackUnblockUsers?: boolean;
  publishers?: boolean;
  approvedPublishersList?: boolean;
  approvedPublishers?: boolean;
  rejectedPublishers?: boolean;
  games?: boolean;
  editGameInfo?: boolean;
  sdkManagement?: boolean;
  restrictGeo?: boolean;
  changePassword?: boolean;
  adminUsers?: boolean;
  userNotes?: boolean;
  editUserInfo?: boolean;
  avatars?: boolean;
}

export interface AdminUserRole {
  _id: string;
  adminUserRoleName?: string;
  permission?: any;
  isActive?: boolean;
}