import multer, { diskStorage } from "multer";
import { nanoid } from "nanoid";
import fs from "fs"

export function fileupload({ folder } = {}) {

    const storage = diskStorage({
        destination: (req, file, cb) => {
            let dest = `upload/${req.user._id}/${folder}`
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true })
            }
            cb(null, dest)
        },
        filename: (req, file, cb) => {
            cb(null, nanoid(6) + "_" + file.originalname)
        }
    })

    const fileFilter = (req, file, cb) => {
        if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
            cb(null, true)
        } else {
            cb(new Error("Invalid file type"), false)
        }
    }

    return multer({ storage, fileFilter })
}
