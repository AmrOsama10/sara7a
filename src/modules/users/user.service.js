
import Joi from "joi";
import { User } from "../../db/model/users.js";
import bcrypt from "bcrypt";
import fs from "fs"
export const updatePassword = async (req, res, next) => {
    const { oldPassword , newPassword } = req.body;
    const schema = Joi.object({
        oldPassword:Joi.string().required(),
        newPassword:Joi.string().required().min(6).max(31)
    })
    const {error,value} = schema.validate(req.body)
    if (error) {
        throw new Error(error.details.map((err)=>err.message).join(", "),{cause:400})
    }

    const user = await User.findById(req.user._id);
    const isMatch = bcrypt.compareSync(oldPassword , user.password);
    
    if (!isMatch) {
        throw new Error("old password is wrong",{cause:400}); 
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    await user.save()
return res.status(200).json({message:"Password updated successfully",success:true})
}

export const updateProfilePicture = async (req,res,next) => {
    if (req.user.profilePicture) {
        fs.unlinkSync(req.user.profilePicture)
    }
    const user = await User.findByIdAndUpdate(req.user._id)
    if (!user) {
        throw new Error("User not found",{cause:404})
    }
    user.profilePicture = req.file.path;
    
    await user.save();
    return res.status(200).json({message:"Profile picture updated successfully",success:true})
}