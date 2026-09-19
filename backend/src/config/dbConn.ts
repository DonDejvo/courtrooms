import Database from "better-sqlite3";
import { config } from "../confg";

let db: Database.Database | null = null;

const connectDB = () => {
    db = new Database(config.databasePath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");

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