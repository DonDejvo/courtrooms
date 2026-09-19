import cookieParser from "cookie-parser";
import { config } from "./confg";
import { connectDB } from "./config/dbConn";
import errorHandler from "./middleware/errorHandler";
import { logger } from "./middleware/logger";
import express from "express";
import http from "http";
import courtroomRoutes from "./routes/courtroomRoutes";
import mediaRoutes from "./routes/mediaRoutes";

async function main() {
    console.log("Environment:", config.nodeEnv);

    const app = express();
    const server = http.createServer(app);

    const apiPrefix = "/api";

    connectDB();

    app.use("/media", mediaRoutes);

    app.use(express.json({ limit: "2mb" }));
    app.use(cookieParser());

    app.use(logger);

    app.use(`${apiPrefix}/Test`, (req, res) => {
        res.send("Server is up and running");
    });

    app.use(`${apiPrefix}/Courtroom`, courtroomRoutes);

    app.use((req, res) => {
        res.status(404).json({ success: false, error: [{ message: "Zdroj nenalazen" }] });
    });

    app.use(errorHandler);

    server.listen(config.port, () => console.log(`Server running on port ${config.port}`));
}

main();