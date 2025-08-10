import connectedDb from "./db/connection.js";
import authRoter from "./modules/auth/auth.controller.js"
import userRouter from "./modules/users/user.controller.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import fs from "fs"

const bootstrap =(app,express)=>{
    app.use(cors({
        origin:"*"
    }));
    connectedDb();
    app.use(express.json());
    app.use(cookieParser())
    app.use(express.static("upload"))
    app.use("/auth",authRoter)
    app.use("/user",userRouter)
    app.use((err,req,res,next)=>{
        if (req.file) {
            fs.unlinkSync(req.file.path)
        }
        return res.status(err.cause || 500).json({
             message: err.message, success: false,stack:err.stack })
    })
}
export default bootstrap;
