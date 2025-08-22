import { model, Schema } from "mongoose";

const schema = new Schema({
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: String,
        minlength: 3,
        maxlength: 1000,
        required: function () {
            if(this.attachments.length > 0){
                return false
            }
            return true
        }
    },
    attachments: [{
        secure_url: String,
        public_id: String
    }]
}, { timestamps: true })

export const Message = model("Message", schema)