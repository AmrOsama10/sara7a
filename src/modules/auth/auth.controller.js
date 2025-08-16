import { Router } from "express";
import * as auth from "./auth.service.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { loginSchema, registerSchema, resetPasswordSchema } from "./auth.validation.js";
import { isAuthntcation } from "../../middleware/isAuthntcation.js";
const router = Router()


router.post("/register", isValid(registerSchema), auth.register)
router.post("/verify-account", auth.verifyAccount)
router.post("/send-otp", auth.sendOtp)
router.post("/login", isValid(loginSchema), auth.login)
router.post("/google-login", auth.googleLogin)
// router.post("/refresh-token", auth.refreshToken)
router.patch("/reset-password",isValid(resetPasswordSchema) ,auth.resetPassword)
router.post("/logout", isAuthntcation, auth.logout)



export default router