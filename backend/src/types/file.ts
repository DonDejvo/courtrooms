export interface FileRow {
    id: number;
    contentHash: string;
    name: string;
    size: number | null;
    mimeType: string | null;
    createdAt: string;
}