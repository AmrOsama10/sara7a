import Joi  from "joi";

export const updatePasswordSchema = Joi.object({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().required().min(6).max(31)
    })