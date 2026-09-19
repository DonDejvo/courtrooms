import { useRef, useState } from "react";
import { CourtroomDetails } from "../types";
import ConfirmModal from "./ConfirmModal";
import SchedulePreviewModal from "./SchedulePreviewModal";
import { formatDate } from "../utils/dateUtils";

type ActionResult = { success: boolean; error?: string };

interface CourtroomCardProps {
    courtroom: CourtroomDetails;
    advancedMode: boolean;
    uploadSchedule: (code: string, file: File) => Promise<ActionResult>;
    removeSchedule: (code: string) => Promise<ActionResult>;
    deleteCourtroom: (code: string) => Promise<ActionResult>;
}

const CourtroomCard = ({
    courtroom,
    advancedMode,
    uploadSchedule,
    removeSchedule,
    deleteCourtroom,
}: CourtroomCardProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploading, setUploading] = useState(false);
    const [removingSchedule, setRemovingSchedule] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const hasSchedule = Boolean(courtroom.currentScheduleUrl);

    const handleUploadClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        setUploading(true);
        setError(null);

        const result = await uploadSchedule(courtroom.code, file);

        setUploading(false);

        if (!result.success) {
            setError(result.error ?? "Nahrání dokumentu se nezdařilo.");
        }
    };

    const handleRemoveSchedule = async () => {
        setRemovingSchedule(true);
        setError(null);

        const result = await removeSchedule(courtroom.code);

        setRemovingSchedule(false);
        setShowRemoveConfirm(false);

        if (!result.success) {
            setError(result.error ?? "Odstranění dokumentu se nezdařilo.");
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        setError(null);

        const result = await deleteCourtroom(courtroom.code);

        setDeleting(false);

        if (!result.success) {
            setError(result.error ?? "Odstranění jednací síně se nezdařilo.");
            setShowDeleteConfirm(false);
        }
        // on success, the card unmounts as soon as the parent list updates
    };

    return (
        <div className="courtroom-card">
            {advancedMode && (
                <button
                    className="card-delete-floating"
                    onClick={() => setShowDeleteConfirm(true)}
                    title="Smazat jednací síň"
                    type="button"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                    </svg>
                </button>
            )}

            <div>
                <h3 className="courtroom-card__title">Jednací síň {courtroom.code}</h3>
            </div>

            <div className="courtroom-card__meta">
                <div>Poslední aktualizace: {courtroom.lastUpdate ? formatDate(courtroom.lastUpdate) : "Nikdy"}</div>
                <div className={`badge ${hasSchedule ? "badge--active" : "badge--empty"}`}>
                    {hasSchedule ? "dokument nahrán" : "Bez dokumentu"}
                </div>
            </div>

            {error && <div className="courtroom-card__error">{error}</div>}

            <div className="courtroom-card__actions">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />
                <button className="btn btn-outline btn-sm" onClick={handleUploadClick} disabled={uploading}>
                    {uploading ? "Nahrávání…" : "Nahrát PDF dokument"}
                </button>

                <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowRemoveConfirm(true)}
                    disabled={!hasSchedule || removingSchedule}
                >
                    Odstranit dokument
                </button>

                <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowPreview(true)}
                    disabled={!hasSchedule}
                >
                    Náhled
                </button>
            </div>

            {showPreview && courtroom.currentScheduleUrl && (
                <SchedulePreviewModal
                    title={"Jednací síň " + courtroom.code}
                    url={courtroom.currentScheduleUrl}
                    onClose={() => setShowPreview(false)}
                />
            )}

            {showRemoveConfirm && (
                <ConfirmModal
                    title="Odstranit dokument"
                    message={`Opravdu odstranit nahraný dokument pro jednací síň "${courtroom.code}"?`}
                    confirmLabel="Odstranit"
                    danger
                    loading={removingSchedule}
                    onConfirm={handleRemoveSchedule}
                    onCancel={() => setShowRemoveConfirm(false)}
                />
            )}

            {showDeleteConfirm && (
                <ConfirmModal
                    title="Smazat jednací síň"
                    message={`Tímto trvale smažete jednací síň "${courtroom.code}" a její dokument. Tuto akci nelze vrátit zpět.`}
                    confirmLabel="Smazat"
                    danger
                    loading={deleting}
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            )}
        </div>
    );
};

export default CourtroomCard;