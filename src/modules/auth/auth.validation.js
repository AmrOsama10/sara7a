import Joi from "joi";
export const registerSchema = Joi.object({
    fullName: Joi.string().required().min(3).max(21),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: Joi.string().required().min(6).max(31),
    phoneNumber: Joi.string().min(10).max(15),
    dob: Joi.date()
}).or("email", "phoneNumber")

export const loginSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: Joi.string().required().min(6).max(21),
    phoneNumber: Joi.string().min(10).max(15),
}).or("email", "phoneNumber")

export const resetPasswordSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    otp: Joi.string().max(5).required(),
    newPassword: Joi.string().required().min(6).max(21),
})
