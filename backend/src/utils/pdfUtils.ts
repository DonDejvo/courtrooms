import { pdfToPng } from "pdf-to-png-converter";
import { getRandomFileName, getTmpDir, unlinkIfExists } from "../helpers/fileHelper";
import path from "node:path";

export const createPngFromPdf = async (pdfPath: string, viewportScale = 2) => {
    const outputFileName = getRandomFileName();

    await pdfToPng(pdfPath, {
        viewportScale,
        outputFolder: getTmpDir(),
        outputFileMaskFunc: () => outputFileName,
        pagesToProcess: [1]
    });

    return path.join(getTmpDir(), outputFileName);
}