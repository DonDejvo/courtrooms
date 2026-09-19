import crypto from "crypto";
import path from "path";
import { config } from "../confg";
import fs from "fs/promises";
import { createReadStream } from "fs";
import { getDB } from "../config/dbConn";
import { FileRow } from "../types/file";

const sha256 = (buffer: Buffer) => {
    return crypto.createHash("sha256").update(new Uint8Array(buffer)).digest("hex");
}

const sha256File = (filePath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash("sha256");
        const stream = createReadStream(filePath);
        stream.on("error", reject);
        stream.on("data", (chunk) => hash.update(chunk));
        stream.on("end", () => resolve(hash.digest("hex")));
    });
}

const getRandomFileName = () => {
    return crypto.randomUUID();
}

const createDirIfNotExists = async (dirPath: string) => {
    await fs.mkdir(dirPath, { recursive: true });
}

const getRelativePathFromHash = (hash: string) => {
    return path.join(hash.slice(0, 2), hash.slice(2, 4), hash);
}

const getAbsolutePathFromHash = (hash: string) => {
    return path.join(config.rootDir, "uploads", getRelativePathFromHash(hash));
}

const getTmpDir = () => {
    return path.join(config.rootDir, "tmp");
}

const getTmpUploadDir = () => {
    return path.join(getTmpDir(), "uploads");
}

const getTmpUploadPath = (filename: string) => {
    return path.join(getTmpUploadDir(), filename);
}

const unlinkIfExists = async (p: string) => {
    try {
        await fs.unlink(p);
    } catch (error: unknown) {
        if ((error as NodeJS.ErrnoException)?.code !== "ENOENT") {
            throw error;
        }
    }
}

const fileExists = async (p: string): Promise<boolean> => {
    try {
        await fs.access(p);
        return true;
    } catch {
        return false;
    }
}

const storeFileByHash = async (
    tmpPath: string
): Promise<{ hash: string; absolutePath: string; isNew: boolean; size: number; }> => {
    const hash = await sha256File(tmpPath);
    const absolutePath = getAbsolutePathFromHash(hash);

    const stat = await fs.stat(tmpPath);
    const size = stat.size;

    let isNew = false;

    if (await fileExists(absolutePath)) {
        await unlinkIfExists(tmpPath);
    } else {
        await createDirIfNotExists(path.dirname(absolutePath));

        try {
            await fs.rename(tmpPath, absolutePath);
            isNew = true;
        } catch (error: unknown) {
            const code = (error as NodeJS.ErrnoException)?.code;
            if (code === "EXDEV") {
                await fs.copyFile(tmpPath, absolutePath);
                await unlinkIfExists(tmpPath);
                isNew = true;
            } else if (code === "EEXIST" || (await fileExists(absolutePath))) {
                await unlinkIfExists(tmpPath);
            } else {
                throw error;
            }
        }
    }

    return { hash, absolutePath, isNew, size };
}

const getRefCount = (hash: string): number => {
    const db = getDB();
    const row = db
        .prepare("SELECT COUNT(*) AS count FROM file WHERE contentHash = ?")
        .get(hash) as { count: number };
    return row.count;
}

const deleteFileIfUnreferenced = async (hash: string) => {
    const refCount = getRefCount(hash);
    if (refCount === 0) {
        await unlinkIfExists(getAbsolutePathFromHash(hash));
    }
}

const deleteFileRecord = async (id: number) => {
    const db = getDB();
    const row = db
        .prepare("SELECT contentHash FROM file WHERE id = ?")
        .get(id) as { contentHash: string } | undefined;

    if (!row) {
        return;
    }

    db.prepare("DELETE FROM file WHERE id = ?").run(id);
    await deleteFileIfUnreferenced(row.contentHash);
}

const createFileRecord = (hash: string, name: string, size: number, mimeType: string): number => {
    const db = getDB();
    const result = db
        .prepare(
            "INSERT INTO file (contentHash, name, size, mimeType) VALUES (?, ?, ?, ?)"
        )
        .run(hash, name, size, mimeType);
    return Number(result.lastInsertRowid);
}

const createFileRecordFromUpload = async (file: Express.Multer.File): Promise<number> => {
    const { hash, size } = await storeFileByHash(file.path);
    return createFileRecord(hash, file.originalname, size, file.mimetype);
}

const createFileRecordFromPath = async (filePath: string, name: string, mimeType: string) => {
    const { hash, size } = await storeFileByHash(filePath);
    return createFileRecord(hash, name, size, mimeType);
}

const getFileRecordById = (id: number) => {
    const db = getDB();
    return db
        .prepare(
            `SELECT * FROM file WHERE id = ?`
        )
        .get(String(id)) as FileRow | undefined;
}

const getFileUrl = (id: number | null) => {
    return id ? `/media/files/${id}` : null;
}

export {
    sha256,
    sha256File,
    getRandomFileName,
    createDirIfNotExists,
    getRelativePathFromHash,
    getAbsolutePathFromHash,
    getTmpDir,
    getTmpUploadDir,
    getTmpUploadPath,
    fileExists,
    unlinkIfExists,
    storeFileByHash,
    deleteFileIfUnreferenced,
    deleteFileRecord,
    createFileRecord,
    getFileRecordById,
    createFileRecordFromUpload,
    createFileRecordFromPath,
    getFileUrl
}