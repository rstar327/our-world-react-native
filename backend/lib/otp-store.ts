// Simple in-memory store for OTP codes
// In production, use Redis or database
interface OTPData {
  code: string;
  email: string;
  expiresAt: Date;
}

const otpStore = new Map<string, OTPData>();

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOTP = (email: string, code: string) => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  otpStore.set(email, { code, email, expiresAt });
};

export const verifyOTP = (email: string, code: string): boolean => {
  const otpData = otpStore.get(email);
  
  if (!otpData) {
    return false;
  }
  
  if (new Date() > otpData.expiresAt) {
    otpStore.delete(email);
    return false;
  }
  
  if (otpData.code === code) {
    otpStore.delete(email);
    return true;
  }
  
  return false;
};