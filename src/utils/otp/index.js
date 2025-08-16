export const generateOtp = (expiryTime = Number(process.env.OTP_EXPIRY)) => {
    const otp = Math.floor(10000 + Math.random() * 90000); 
    const otpExpiry = Date.now() + 2 * 60 * 1000;
    return {otp,otpExpiry};
}
