import connectedDb from "./db/connection.js";
import authRoter from "./modules/auth/auth.controller.js"
import userRouter from "./modules/users/user.controller.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import{rateLimit} from "express-rate-limit"
import { globalError } from "./utils/error/index.js";
import messageRouter from "./modules/message/message.controller.js"

const bootstrap =(app,express)=>{

    const limiter = rateLimit({
        windowMs: 60 * 1000,
        limit:5,
        handler:(req ,res,next,options)=>{
            throw new Error(options.message, { cause: options.statusCode })
        }
    })

    app.use(limiter)

    app.use(cors({
        origin:"*"
    }));
    connectedDb();
    app.use(express.json());
    app.use(cookieParser())
    app.use(express.static("upload"))
    app.use("/auth",authRoter)
    app.use("/user",userRouter)
    app.use("/message",messageRouter)
    app.use(globalError)
}
export default bootstrap;
