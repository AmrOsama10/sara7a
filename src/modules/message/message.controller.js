import { Router } from "express";
import { isValid } from "../../middleware/validation.middleware.js";
import { sendMessageSchema } from "./message.validation.js";
import * as message from "./message.service.js";
import { fileuploadCloude } from "../../utils/multer/cloud.js";
import { isAuthntcation } from "../../middleware/isAuthntcation.js";
import { fileValidation } from "../../middleware/file.validation.middleware.js";
const router = Router()

router.post("/:receiver", fileuploadCloude().array("attachments", 2),
fileValidation(),
    isValid(sendMessageSchema),message.sendMessage)
router.get("/:messageId",isAuthntcation,message.getMessage)

export default router