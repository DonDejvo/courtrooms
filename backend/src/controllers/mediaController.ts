import { Request, Response } from "express";
import { parseWithZod } from "../utils/zodUtils";
import { getFileContentByIdSchema } from "../validation/mediaSchema";
import { fileExists, getAbsolutePathFromHash, getFileRecordById } from "../helpers/fileHelper";
import { ZodError } from "zod";
import fs from "fs";

const getFileContentById = async (req: Request, res: Response) => {
    try {
        const { params } = parseWithZod(getFileContentByIdSchema, req);
        const { id } = params;

        const fileRecord = getFileRecordById(id);
        if (!fileRecord) {
            res.status(404).end();
            return;
        }

        const absPath = getAbsolutePathFromHash(fileRecord.contentHash);
        if (!(await fileExists(absPath))) {
            res.status(404).end();
            return;
        }

        const etag = `"${fileRecord.id.toString()}-${new Date(fileRecord.createdAt).getTime()}"`;

        res.setHeader("Content-Type", fileRecord.mimeType ?? "text/plain");
        res.setHeader("Content-Length", String(fileRecord.size));
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        res.setHeader("ETag", etag);

        if (req.headers["if-none-match"] === etag) {
            res.status(304).end();
            return;
        }

        const stream = fs.createReadStream(absPath);
        stream.on("error", () => res.status(500).end());
        stream.pipe(res);

    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).end();
        } else {
            console.log("Media controller error:", error);
            res.status(500).end();
        }
    }
}

const mediaController = {
    getFileContentById
};

export default mediaController;