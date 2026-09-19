import z from "zod";

const courtroomCode = z
    .string()
    .min(1, "Kód jednací síně musí mít alespoň 1 znaky")
    .max(20, "Kód jednací síně nesmí přesáhnout 20 znaků")
    .regex(/^([a-z0-9]+-)*[a-z0-9]+$/i, "Kód jednací síně může obsahovat pouze písmena, čísla a pomlčky");

export const getCourtroomSchema = z.object({
    params: z.object({
        code: courtroomCode
    })
});

export const createCourtroomSchema = z.object({
    body: z.object({
        code: courtroomCode
    })
});

export const deleteCourtroomSchema = z.object({
    body: z.object({
        code: courtroomCode
    })
});

export const uploadCourtroomScheduleFromPdfSchema = z.object({
    body: z.object({
        code: courtroomCode
    })
});

export const removeCourtroomScheduleSchema = z.object({
    body: z.object({
        code: courtroomCode
    })
});