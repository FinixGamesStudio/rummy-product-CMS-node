export interface AdminNotification {
  _id: string;
  userId: string;
  notificationTitle: string;
  notificationDescription: string;
  notificationCategory: string;
  notificationData: object;
  isRead: boolean;
  readAt?: Date;
}

export interface CreateAdminNotificationData {
  userId: string;
  notificationTitle: string;
  notificationDescription?: string;
  notificationCategory: string;
  notificationData?: object;
  isRead: boolean;
}
