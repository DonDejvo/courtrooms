import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { parseWithZod } from "../utils/zodUtils";
import { createCourtroomSchema, deleteCourtroomSchema, getCourtroomSchema, removeCourtroomScheduleSchema, uploadCourtroomScheduleFromPdfSchema } from "../validation/courtroomSchema";
import HttpError from "../exceptions/HttpError";
import uploadFile from "../middleware/uploadFile";
import {
    listCourtrooms,
    getCourtroomByCode,
    courtroomExists,
    insertCourtroom,
    deleteCourtroomByCode,
    setCourtroomCurrentFileId,
    clearAllCourtroomFileIds,
    formatCourtroomDetails,
} from "../helpers/courtroomHelper";
import { createFileRecordFromPath, getFileUrl, unlinkIfExists } from "../helpers/fileHelper";
import { createPngFromPdf } from "../utils/pdfUtils";

const getCourtroomList = asyncHandler(async (req: Request, res: Response) => {
    const courtrooms = listCourtrooms();
    res.json({ 
        success: true, 
        data: { 
            count: courtrooms.length, 
            courtrooms: courtrooms.map(e => formatCourtroomDetails(e)) 
        } 
    });
});

const getCourtroom = asyncHandler(async (req: Request, res: Response) => {
    const { params } = parseWithZod(getCourtroomSchema, req);

    const courtroom = getCourtroomByCode(params.code);
    if (!courtroom) {
        throw new HttpError(404, `jednací síň "${params.code}" nenalezena`);
    }

    res.json({ 
        success: true, 
        data: { 
            courtroom: formatCourtroomDetails(courtroom)
        } 
    });
});

const createCourtroom = asyncHandler(async (req: Request, res: Response) => {
    const { body } = parseWithZod(createCourtroomSchema, req);

    if (courtroomExists(body.code)) {
        throw new HttpError(409, `jednací síň "${body.code}" již existuje`);
    }

    insertCourtroom(body.code);

    const courtroom = getCourtroomByCode(body.code)!;
    res.json({ 
        success: true, 
        data: { 
            courtroom: formatCourtroomDetails(courtroom)
        } 
    });
});

const deleteCourtroom = asyncHandler(async (req: Request, res: Response) => {
    const { body } = parseWithZod(deleteCourtroomSchema, req);

    const changes = await deleteCourtroomByCode(body.code);
    if (changes === 0) {
        throw new HttpError(404, `jednací síň "${body.code}" nenalezena`);
    }

    res.json({ success: true });
});

const schedulePdfFile = uploadFile({ maxFileSizeBytes: 10 * 1024 * 1024, allowedMimeRegex: /^application\/pdf$/i });

const uploadScheduleFromPdf = asyncHandler(async (req: Request, res: Response) => {
    const { body } = parseWithZod(uploadCourtroomScheduleFromPdfSchema, req);
    const { code } = body;

    if (!req.file) {
        throw new HttpError(400, "Nebyl nahrán žádný PDF soubor");
    }

    const file = req.file;

    const courtroom = getCourtroomByCode(code);
    if (!courtroom) {
        await unlinkIfExists(file.path);
        throw new HttpError(404, `jednací síň "${body.code}" nenalezena`);
    }

    let pngPath: string | undefined;
    try {
        pngPath = await createPngFromPdf(file.path);

        const fileId = await createFileRecordFromPath(pngPath, file.originalname, "image/png");
        await setCourtroomCurrentFileId(code, fileId);

        res.json({ success: true, data: { currentScheduleUrl: getFileUrl(fileId) } });
    } finally {
        await unlinkIfExists(file.path);
        if (pngPath) {
            await unlinkIfExists(pngPath);
        }
    }
});

const removeSchedule = asyncHandler(async (req: Request, res: Response) => {
    const { body } = parseWithZod(removeCourtroomScheduleSchema, req);
    const { code } = body;

    const courtroom = getCourtroomByCode(code);
    if (!courtroom) {
        throw new HttpError(404, `jednací síň "${body.code}" nenalezena`);
    }

    if (courtroom.currentFileId) {
        await setCourtroomCurrentFileId(code, null);
    }

    res.json({ success: true });
});

const removeAllSchedules = asyncHandler(async (req: Request, res: Response) => {
    const count = await clearAllCourtroomFileIds();

    res.json({ success: true, data: { count } });
});

const courtroomController = {
    getCourtroom,
    getCourtroomList,
    createCourtroom,
    deleteCourtroom,
    schedulePdfFile,
    uploadScheduleFromPdf,
    removeSchedule,
    removeAllSchedules
};

export default courtroomController;