import { User } from "../../db/model/users.js";
import bcrypt from "bcrypt";
import sendEmail from "../../utils/sendEmail/index.js";
import { generateOtp } from "../../utils/otp/index.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";



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
        password: bcrypt.hashSync(password, 10),
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
    const user = await User.findOne({
        email,
        otp,
        otpExpiry: { $gt: Date.now() }
    })
    if (!user) {
        throw new Error("Invalid otp", { cause: 400 })
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return res.status(200).json({ message: "User verified successfully", success: true })
}

export const resendOtp = async (req, res) => {
    const { email } = req.body;
    const { otp, otpExpiry } = generateOtp();
    await User.updateOne({ email }, { otp, otpExpiry })
    sendEmail({
        to: email,
        subject: "Verify your email",
        html: `<h1>your new otp is ${otp}</h1>`
    })
    return res.status(200).json({ message: "Otp sent successfully", success: true })
}

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
    const isValidPassword = bcrypt.compareSync(password, userExist.password)

    if (!isValidPassword) {
        throw new Error("invalid credentials", { cause: 400 })
    }
    const token = jwt.sign({ id: userExist._id }, process.env.JWT_SECRET, { expiresIn: "1h" })
    const refreshToken = jwt.sign({ id: userExist._id }, process.env.JWT_SECRET, { expiresIn: "7d" })
    userExist.refreshToken = refreshToken;
    await userExist.save();
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.status(200).json({ message: "User logged in successfully", success: true, token })
}

export const refreshToken = async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
        throw new Error("Unauthorized", { cause: 401 })
    }
    const user = await User.findOne({ refreshToken })
    if (!user) {
        throw new Error("Unauthorized", { cause: 401 })
    }
    jwt.verify( user.refreshToken , process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            throw new Error("Invalid refresh token", { cause: 403 });
        }
        const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: "1h" })
        return res.status(200).json({ message: "User logged in successfully", success: true, accessToken })
    })

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

