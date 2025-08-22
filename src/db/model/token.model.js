import { model, Schema } from "mongoose";

const tokenSchema = new Schema({
    token: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    type: {
        type:String,
        enum: ["access","refresh" ],
        default: "access"
    },
    expiresAt: {
        type: Date, 
        required: true 
    }

}, { timestamps: true })

tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const Token = model("Token", tokenSchema)