export const generateOtp = (expiryTime = Number(process.env.OTP_EXPIRY)) => {
    const otp = Math.floor(1000 + Math.random() * 9000);
    const otpExpiry = Date.now() + expiryTime;
    return {otp,otpExpiry};
}
