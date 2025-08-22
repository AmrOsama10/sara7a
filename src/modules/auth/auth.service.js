import { User } from "../../db/model/users.model.js";
import sendEmail from "../../utils/sendEmail/index.js";
import { generateOtp } from "../../utils/otp/index.js";
import { OAuth2Client } from "google-auth-library";
import { Token } from "../../db/model/token.model.js";
import { generateToken, verifyToken } from "../../utils/token/index.js";
import { comparePassword, hashPassword } from "../../utils/hashing/index.js"


export const register = async (req, res) => {

    const { fullName, email, password, phoneNumber, dob } = req.body;

    const userExist = await User.findOne({
        $or: [
            {
                $and: [
                    { email: { $exists: true } },
                    { email: { $ne: null } },
                    { email: email }
                ]
            },
            {
                $and: [
                    { phoneNumber: { $exists: true } },
                    { phoneNumber: { $ne: null } },
                    { phoneNumber: phoneNumber }
                ]
            }
        ]
    })
    if (userExist) {
        throw new Error("User already exists", { cause: 409 });
    }
    const user = new User({
        fullName,
        email,
        password: hashPassword(password),
        phoneNumber,
        dob
    })
    const { otp, otpExpiry } = generateOtp();
    user.otp = otp;
    user.otpExpiry = otpExpiry;

    sendEmail({
        to: email,
        subject: "Verify your email",
        html: `<h1>your otp is ${otp}</h1>`
    })

    await user.save();
    user.otp = undefined;
    user.otpExpiry = undefined;

    return res.status(201).json({ message: "User created successfully", success: true, user })
}

export const verifyAccount = async (req, res) => {
    const { otp, email } = req.body;
    const user = await User.findOne({ email });

    if (!user) throw new Error("User not found", { cause: 404 });

    if (user.otp !== otp || user.otpExpiry < Date.now()) {

        await user.save();
        throw new Error("Invalid or expired OTP", { cause: 400 });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    return res.status(200).json({ message: "User verified successfully", success: true });
};

export const sendOtp = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found", { cause: 404 });

    const { otp, otpExpiry } = generateOtp();
    user.otp = otp;
    user.otpExpiry = otpExpiry;


    await user.save();

    sendEmail({
        to: email,
        subject: "Verify your email",
        html: `<h1>Your new OTP is ${otp}</h1>`
    });

    return res.status(200).json({ message: "Otp sent successfully", success: true });
};

export const login = async (req, res) => {
    const { email, phoneNumber, password } = req.body;
    const userExist = await User.findOne({
        $or:
            [{
                $and: [
                    {
                        email: {
                            $exists: true,
                            $ne: null
                        }
                    },
                    { email: email }
                ]
            },
            {
                $and: [
                    {
                        phoneNumber: {
                            $exists: true,
                            $ne: null
                        }
                    },
                    { phoneNumber: phoneNumber }
                ]
            }

            ]
    })
    if (!userExist) {
        throw new Error("invalid credentials", { cause: 404 })
    }
    const isValidPassword = comparePassword(password, userExist.password)

    if (!isValidPassword) {
        throw new Error("invalid credentials", { cause: 400 })
    }

    if (userExist.deletedAt){
        userExist.deletedAt = undefined;
        userExist.save()
    }
    
    const accessToken = generateToken({
        payload: { id: userExist._id },
        options: { expiresIn: "5s" }
    })
    const refreshToken = generateToken({
        payload: { id: userExist._id },
        options: { expiresIn: "7d" }
    })
    await Token.create({
        token: refreshToken,
        user: userExist._id,
        type: "refresh",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })
    return res.status(200).json({ message: "User logged in successfully", success: true, accessToken, refreshToken })
}

export const googleLogin = async (req, res) => {
    const { idToken } = req.body;
    const clint = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await clint.verifyIdToken({ idToken })
    const payload = ticket.getPayload()
    let userExist = await User.findOne({ email: payload.email })
    if (!userExist) {
        userExist = await User.create({
            fullName: payload.name,
            email: payload.email,
            phoneNumber: payload.phone,
            dob: payload.birthd,
            isVerified: true,
            userAgent: "google",
        })
    }
    return res.status(200).json({ message: "User logged in successfully", success: true, userExist })
}

export const resetPassword = async (req, res, next) => {
    const { email, otp, newPassword } = req.body
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error("user not found", { cause: 404 });
    }
    if (user.otp !== otp) {
        throw new Error("Invalid otp", { cause: 400 });
    }
    if (Date.now() > user.otpExpiry) {
        throw new Error("otp expired", { cause: 400 });
    }
    user.password = hashPassword(newPassword)
    user.credentionalUpdatedAt = Date.now()
    user.otp = undefined;
    user.otpExpiry = undefined
    await user.save()
    await Token.deleteMany({ user: user._id, type: "refresh" })
    return res.status(200).json({ message: "Password reset successfully", success: true })
}

export const logout = async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        throw new Error("token is required", { cause: 401 })
    }

    await Token.create({ token, user: req.user._id })

    return res.status(200).json({ message: "User logged out successfully", success: true })
}