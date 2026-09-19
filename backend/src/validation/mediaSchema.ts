import z from "zod";

export const getFileContentByIdSchema = z.object({
    params: z.object({
        id: z.coerce.number().int().positive()
    })
});