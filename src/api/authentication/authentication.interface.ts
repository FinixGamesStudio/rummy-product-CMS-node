export interface RegisterUser {
  email: string;
  password: string;
  role: string;
  isBlock?: boolean;
}

export interface ForgotPassword {
  userId: string;
  email: string;
  resetToken: string;
}

export interface UserOtp {
  phoneNumber: string;
  otp: string;
}

export interface SendUserOtpData {
  phoneNumber: string;
}

export interface VerifyUserOtpData {
  phoneNumber: string;
  otp: string;
}

export interface SendOtpData {
  phoneNumber: string;
  otp: string;
  messageString: string;
}
