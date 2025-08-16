import jwt from "jsonwebtoken";
import { User } from "../db/model/users.js";
import { Token } from "../db/model/token.model.js";

export const isAuthntcation = async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        throw new Error("token is required",{cause:401});
        
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userExsit = await User.findById(payload.id);
    if (!userExsit) {
        throw new Error("User not found",{cause:401});
    }

    const blockedToken = await Token.findOne({token,type:"access"})
    if(blockedToken){
        throw new Error("invalid token",{cause:401})
    }

    req.user = userExsit;
     return  next();
};

