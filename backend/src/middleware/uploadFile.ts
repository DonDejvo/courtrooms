import multer from "multer";
import MulterFileTypeError from "../exceptions/MulterFileTypeError";
import { createDirIfNotExists, getTmpUploadDir, getRandomFileName } from "../helpers/fileHelper";

type UploadFileOptions = {
    maxFileSizeBytes: number;
    allowedMimeRegex: RegExp;
};

const uploadFile = (options: UploadFileOptions) => {
    return multer({
        storage: multer.diskStorage({
            async destination(_req, _file, cb) {
                const dir = getTmpUploadDir();
                try {
                    await createDirIfNotExists(dir);
                    cb(null, dir);
                } catch (error) {
                    cb(error as Error, dir);
                }
            },
            filename(_req, _file, cb) {
                cb(null, getRandomFileName());
            },
        }),

        limits: {
            fileSize: options.maxFileSizeBytes,
            files: 1,
        },

        fileFilter(_req, file, cb) {
            if (options.allowedMimeRegex.test(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new MulterFileTypeError("Nepodporovaný typ souboru"));
            }
        },
    }).single("file");
};

export default uploadFile;