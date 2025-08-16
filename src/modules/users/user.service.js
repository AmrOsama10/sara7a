import { User } from "../../db/model/users.js";
import bcrypt from "bcrypt";
import fs from "fs"
import cloudinary from "../../cloud/cloudinary.config.js";
export const updatePassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    const isMatch = bcrypt.compareSync(oldPassword, user.password);

    if (!isMatch) {
        throw new Error("old password is wrong", { cause: 400 });
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    await user.save()
    return res.status(200).json({ message: "Password updated successfully", success: true })
}

export const updateProfilePicture = async (req, res, next) => {
    if (req.user.profilePicture) {
        fs.unlinkSync(req.user.profilePicture)
    }
    const user = await User.findByIdAndUpdate(req.user._id)
    if (!user) {
        throw new Error("User not found", { cause: 404 })
    }
    user.profilePicture = req.file.path;

    await user.save();
    return res.status(200).json({ message: "Profile picture updated successfully", success: true })
}

export const uploadProfilePictureCloud = async (req, res, next) => {
    const user = req.user;
    const file = req.file.path;
    if (user.profilePicture?.public_id) {
        await cloudinary.uploader.destroy(user.profilePicture.public_id);
    }
    const { secure_url, public_id } = await cloudinary.uploader.upload(file, {
        folder: `saraha/users/${user._id}/profile-picture`,
    })
    await User.updateOne({ _id: req.user._id }, { profilePicture: { secure_url, public_id } })
    return res.status(200).json({ message: "Profile picture updated successfully", success: true })
}

export const deleteAccount = async (req, res, next) => {
    if (req.user.profilePicture.public_id) {
        await cloudinary.api.delete_resources_by_prefix(`saraha/users/${req.user._id}`)
        await cloudinary.api.delete_folder(`saraha/users/${req.user._id}`)
    }

    await User.deleteOne({ _id: req.user._id })
    return res.status(200).json({ message: "Account deleted successfully", success: true })
}

