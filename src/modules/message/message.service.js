import { User } from "../../db/model/users.model.js";
import { uploadFiles } from "../../cloud/cloudinary.config.js";
import { Message } from "../../db/model/message.model.js";
export const sendMessage = async (req, res, next) => {
    const { receiver } = req.params;
    const { content } = req.body;
    const { files } = req;
    
    const user = await User.findById(receiver);
    if (!user) {
        throw new Error("User not found", { cause: 404 })
    }
    let attachments = [];
    attachments = await uploadFiles(
        files,
        { folder: `saraha/users/${receiver}/messages` }
    )

    await Message.create({
        receiver,
        content,
        attachments
    })
    return res.status(200).json({ message: "Message sent successfully", success: true })
}

export const getMessage = async (req, res, next) => {
    const {messageId} = req.params;
    const message = await Message.findOne({ _id:messageId , receiver: req.user._id });
    if (!message) {
        throw new Error("Message not found", { cause: 404 })
    }
    return res.status(200).json({ message: "Message fetched successfully", success: true, message })
}
