import { useEffect, useState } from "react";
import { useApi } from "../context/apiCommunication";
import {
    CourtroomDetails,
    CreateCourtroomData,
    GetCourtroomListData,
    UploadScheduleFromPdfData,
} from "../types";

const sortByCode = (rooms: CourtroomDetails[]) =>
    [...rooms].sort((a, b) => a.code.localeCompare(b.code));

export const useCourtrooms = () => {
    const { sendJsonRequest } = useApi();

    const [courtrooms, setCourtrooms] = useState<CourtroomDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCourtrooms = async () => {
        if (loading) return;

        setLoading(true);
        setError(null);

        const res = await sendJsonRequest<GetCourtroomListData>("/Courtroom", "GET");

        if (!res.success || !res.data) {
            setError(res.error?.[0].message!);
        } else {
            setCourtrooms(sortByCode(res.data.courtrooms));
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchCourtrooms();
    }, []);

    const createCourtroom = async (code: string) => {
        const res = await sendJsonRequest<CreateCourtroomData>("/Courtroom", "POST", {
            code
        });

        if (!res.success) {
            return { success: false, error: res.error?.[0].message };
        }

        setCourtrooms((prev) => sortByCode([...prev, res.data!.courtroom]));
        return { success: true };
    }

    const deleteCourtroom = async (code: string) => {
        const res = await sendJsonRequest("/Courtroom", "DELETE", { code });

        if (!res.success) {
            return { success: false, error: res.error?.[0].message };
        }

        setCourtrooms((prev) => prev.filter((c) => c.code !== code));
        return { success: true };
    }

    const uploadSchedule = async (code: string, file: File) => {
        const res = await sendJsonRequest<UploadScheduleFromPdfData>(
            "/Courtroom/UploadScheduleFromPdf",
            "POST",
            { code, file },
            {},
            true
        );

        if (!res.data) {
            return { success: false, error: res.error?.[0].message };
        }

        const { currentScheduleUrl } = res.data;
        const now = new Date().toISOString();

        setCourtrooms((prev) =>
            prev.map((c) => (c.code === code ? { ...c, currentScheduleUrl, lastUpdate: now } : c))
        );
        return { success: true };
    }

    const removeSchedule = async (code: string) => {
        const res = await sendJsonRequest("/Courtroom/RemoveSchedule", "POST", { code });

        if (!res.success) {
            return { success: false, error: res.error?.[0].message };
        }

        const now = new Date().toISOString();
        setCourtrooms((prev) =>
            prev.map((c) => (c.code === code ? { ...c, currentScheduleUrl: null, lastUpdate: now } : c))
        );
        return { success: true };
    }

    const removeAllSchedules = async () => {
        const res = await sendJsonRequest("/Courtroom/RemoveAllSchedules", "POST");

        if (!res.success) {
            return { success: false, error: res.error?.[0].message };
        }

        const now = new Date().toISOString();
        setCourtrooms((prev) =>
            prev.map((c) => (c.currentScheduleUrl ? { ...c, currentScheduleUrl: null, lastUpdate: now } : c))
        );
        return { success: true };
    }

    return {
        courtrooms,
        loading,
        error,
        fetchCourtrooms,
        createCourtroom,
        deleteCourtroom,
        uploadSchedule,
        removeSchedule,
        removeAllSchedules,
    };
};