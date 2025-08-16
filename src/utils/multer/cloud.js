import multer, { diskStorage } from "multer";

export function fileuploadCloude() {
    const storage = diskStorage({})
    const fileFilter = (req, file, cb) => {
        if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
            cb(null, true)
        } else {
            cb(new Error("Invalid file type"), false)
        }
    }
    return multer({ storage, fileFilter })
}