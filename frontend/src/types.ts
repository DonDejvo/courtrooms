export interface CourtroomDetails {
    code: string;
    lastUpdate: string | null;
    currentScheduleUrl: string | null;
}

export interface CreateCourtroomData {
    courtroom: CourtroomDetails;
}

export interface GetCourtroomData {
    courtroom: CourtroomDetails;
}

export interface GetCourtroomListData {
    count: number;
    courtrooms: CourtroomDetails[];
}

export interface UploadScheduleFromPdfData {
    currentScheduleUrl: string;
}