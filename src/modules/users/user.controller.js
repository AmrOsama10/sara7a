import {Router} from "express"
import * as user from "./user.service.js"
import { protect } from "../../utils/token/index.js"
import { fileupload } from "../../utils/multer/index.js"
import { fileValidation } from "../../middleware/file.validation.middleware.js"
const router = Router()

router.patch("/update-password",protect,user.updatePassword)
router.post("/upload-profile-picture",
protect,
fileupload({folder:"profile-picture"}).single("profilePicture"), fileValidation(),
user.updateProfilePicture)


export default router