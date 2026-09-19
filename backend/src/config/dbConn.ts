import { DatabaseSync } from "node:sqlite";
import { config } from "../confg";

let db: DatabaseSync | null = null;

const connectDB = () => {
    db = new DatabaseSync(config.databasePath);
    db.exec("PRAGMA journal_mode = WAL");
    db.exec("PRAGMA foreign_keys = ON");

    console.log("Connected to DB successfully");
}

const getDB = () => {
    if (!db) {
        throw new Error("DB not connected");
    }
    return db;
}

export {
    connectDB,
    getDB
}