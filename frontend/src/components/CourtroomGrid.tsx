import { CourtroomDetails } from "../types";
import CourtroomCard from "./CourtroomCard";
import AddCourtroomCard from "./AddCourtroomCard";

type ActionResult = { success: boolean; error?: string };

interface CourtroomGridProps {
    courtrooms: CourtroomDetails[];
    advancedMode: boolean;
    onAddCourtroom: () => void;
    uploadSchedule: (code: string, file: File) => Promise<ActionResult>;
    removeSchedule: (code: string) => Promise<ActionResult>;
    deleteCourtroom: (code: string) => Promise<ActionResult>;
}

const CourtroomGrid = ({
    courtrooms,
    advancedMode,
    onAddCourtroom,
    uploadSchedule,
    removeSchedule,
    deleteCourtroom,
}: CourtroomGridProps) => {
    if (courtrooms.length === 0 && !advancedMode) {
        return (
            <div className="empty-state">
                <div className="empty-state__title">Zatím žádné jednací síně</div>
                <p>Zapněte pokročilé možnosti a přidejte první jednací síň.</p>
            </div>
        );
    }

    return (
        <div className="courtroom-grid">
            {courtrooms.map((courtroom) => (
                <CourtroomCard
                    key={courtroom.code}
                    courtroom={courtroom}
                    advancedMode={advancedMode}
                    uploadSchedule={uploadSchedule}
                    removeSchedule={removeSchedule}
                    deleteCourtroom={deleteCourtroom}
                />
            ))}
            {advancedMode && <AddCourtroomCard onClick={onAddCourtroom} />}
        </div>
    );
};

export default CourtroomGrid;