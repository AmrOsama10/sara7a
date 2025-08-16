
import { Token } from "../../db/model/token.model.js";
import { verifyToken } from "../token/index.js";

export default function asyncHadler(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch((error) => {
            next(error)
        })
    }
}

export const globalError = async (err, req, res, next) => {
    if (err.message == "jwt expired") {
        const refreshToken = req.headers.refreshToken;
        const payload = verifyToken(refreshToken)

        const tokenExist = await Token.findOneAndDelete({
            token: refreshToken,
            user: payload.id,
            type: "refresh"
        })
        if (!tokenExist) {
            throw new Error("Unauthorized", { cause: 401 })
        }
       
            const accessToken = generateToken({ 
                payload: { id: payload.id },
                options:{expiresIn:"15m"}
                
            })

            const newRefreshToken = generateToken({ 
                payload: { id: payload.id },
                options:{expiresIn:"7d"}
                
            })

            await Token.create({
                token:newRefreshToken,
                user:payload.id,
                type:"refresh"
            })


            return res.status(200).json({ message: "User logged in successfully", success: true, accessToken,newRefreshToken })
        
    }
    if (req.file) {
        fs.unlinkSync(req.file.path)
    }
    return res.status(err.cause || 500).json({
        message: err.message, success: false, stack: err.stack
    })
}