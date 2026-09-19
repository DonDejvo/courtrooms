import dotenv from "dotenv";
dotenv.config();

const config = {
    nodeEnv: process.env.NODE_ENV as ("development" | "production"),

    rootDir: process.env.ROOT_DIR as string,

    port: Number(process.env.PORT) || 5500,

    databasePath: process.env.DATABASE_PATH as string,

    logDir: process.env.LOG_DIR as string
};

const required = ["rootDir", "port", "databasePath", "logDir"];

for(let [k, v] of Object.entries(config)) {
    if(v !== undefined) continue;
    if(k in required) {
        throw new Error(`Environment varible ${k} is required but missing`);
    } else {
        console.warn(`Environment varible ${k} is not set`);
    }
}

export {config};