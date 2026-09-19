import { getDB } from "../config/dbConn";
import { CourtroomRow } from "../types/courtroom";
import { deleteFileRecord, getFileUrl } from "./fileHelper";

const listCourtrooms = (): CourtroomRow[] => {
    const db = getDB();
    return db
        .prepare<[], CourtroomRow>(
            `SELECT * FROM courtroom ORDER BY code ASC`
        )
        .all();
}

const getCourtroomByCode = (code: string): CourtroomRow | undefined => {
    const db = getDB();
    return db
        .prepare<[string], CourtroomRow>(
            `SELECT * FROM courtroom WHERE code = ?`
        )
        .get(code);
}

const courtroomExists = (code: string): boolean => {
    const db = getDB();
    const row = db.prepare(`SELECT 1 FROM courtroom WHERE code = ?`).get(code);
    return row !== undefined;
}

const insertCourtroom = (code: string) => {
    const db = getDB();
    db.prepare(
        `INSERT INTO courtroom (code, lastUpdate, currentFileId) VALUES (?, NULL, NULL)`
    ).run(code);
}

const deleteCourtroomByCode = async (code: string): Promise<number> => {
    const db = getDB();

    const existing = db
        .prepare<[string], { currentFileId: number | null }>(
            `SELECT currentFileId FROM courtroom WHERE code = ?`
        )
        .get(code);

    const result = db.prepare(`DELETE FROM courtroom WHERE code = ?`).run(code);

    if (result.changes > 0 && existing?.currentFileId != null) {
        await deleteFileRecord(existing.currentFileId);
    }

    return result.changes;
}

const setCourtroomCurrentFileId = async (code: string, fileId: number | null) => {
    const db = getDB();

    const existing = db
        .prepare<[string], { currentFileId: number | null }>(
            `SELECT currentFileId FROM courtroom WHERE code = ?`
        )
        .get(code);

    db.prepare(
        `UPDATE courtroom SET currentFileId = ?, lastUpdate = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE code = ?`
    ).run(fileId, code);

    if (existing?.currentFileId != null) {
        await deleteFileRecord(existing.currentFileId);
    }
}

const clearAllCourtroomFileIds = async (): Promise<number> => {
    const db = getDB();
    const rows = db
        .prepare(`SELECT currentFileId FROM courtroom WHERE currentFileId IS NOT NULL`)
        .all() as { currentFileId: number }[];

    db.prepare(
        `UPDATE courtroom SET currentFileId = NULL, lastUpdate = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE currentFileId IS NOT NULL`
    ).run();

    for (const row of rows) {
        await deleteFileRecord(row.currentFileId);
    }

    return rows.length;
}

const formatCourtroomDetails = (courtroom: CourtroomRow) => {
    return {
        code: courtroom.code,
        lastUpdate: courtroom.lastUpdate,
        currentScheduleUrl: getFileUrl(courtroom.currentFileId)
    };
}

export {
    listCourtrooms,
    getCourtroomByCode,
    courtroomExists,
    insertCourtroom,
    deleteCourtroomByCode,
    setCourtroomCurrentFileId,
    clearAllCourtroomFileIds,
    formatCourtroomDetails
}