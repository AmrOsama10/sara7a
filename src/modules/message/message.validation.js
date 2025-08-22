import joi from "joi";

export const sendMessageSchema = joi.object({
    content: joi.string().min(3).max(1000),
    receiver: joi.string().hex().length(24).required(),
    sender: joi.string().hex().length(24),
    
}).required()