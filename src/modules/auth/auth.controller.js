import { Router } from "express";
import * as auth from "./auth.service.js";
import { isValid } from "../../middleware/validation.middleware.js";
import { loginSchema, registerSchema } from "./auth.validation.js";
const router = Router()


router.post("/register", isValid(registerSchema), auth.register)
router.post("/verify-account", auth.verifyAccount)
router.post("/resend-otp", auth.resendOtp)
router.post("/login", isValid(loginSchema), auth.login)
router.post("/google-login", auth.googleLogin)
router.post("/refresh-token", auth.refreshToken)



export default router