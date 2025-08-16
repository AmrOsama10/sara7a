import {Router} from "express"
import * as user from "./user.service.js"
import { fileupload } from "../../utils/multer/index.js"
import { fileValidation } from "../../middleware/file.validation.middleware.js"
import { fileuploadCloude } from "../../utils/multer/cloud.js"
import { isAuthntcation } from "../../middleware/isAuthntcation.js"
import { isValid } from "../../middleware/validation.middleware.js"
import { updatePasswordSchema } from "./user.validation.js"
const router = Router()

router.patch("/update-password", isAuthntcation,isValid(updatePasswordSchema),
user.updatePassword)

router.post("/upload-profile-picture",
isAuthntcation,
fileupload({folder:"profile-picture"}).single("profilePicture"), fileValidation(),
user.updateProfilePicture)

router.post("/upload-profile-picture-cloud",
isAuthntcation,fileuploadCloude().single("profilePicture"),
fileValidation(),user.uploadProfilePictureCloud)

router.delete("/delete-account",isAuthntcation,user.deleteAccount)


export default router