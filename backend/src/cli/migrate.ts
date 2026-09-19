import { connectDB, getDB } from "../config/dbConn";

async function main() {
    connectDB();
    const db = getDB();

    db.exec(`
        CREATE TABLE IF NOT EXISTS file (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            contentHash TEXT NOT NULL,
            name        TEXT NOT NULL,
            size        INTEGER,
            mimeType    TEXT,
            createdAt   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );
    `);

    db.exec(`
        CREATE TABLE IF NOT EXISTS courtroom (
            code          TEXT PRIMARY KEY,
            lastUpdate    TEXT,
            currentFileId INTEGER,
            FOREIGN KEY (currentFileId) REFERENCES file(id) ON DELETE SET NULL
        );
    `);

    console.log("Tables created (or already existed).");

    process.exit(0);
}

main();