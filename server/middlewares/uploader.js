import multer from 'multer'
import path from 'path'


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * "1E9")
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
    }
})



const fileFilter = (req, file, cb) => {
    console.log(file)
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
        cb(null, true)
    }

    else {
        cb(new Error("Only PDF or TXT Files supported!"), false)
    }
}


const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 40
    },
    fileFilter: fileFilter
})


export default upload