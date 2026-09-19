import { useState } from "react";
import { useCourtrooms } from "./hooks/useCourtrooms";
import Header from "./components/Header";
import CourtroomGrid from "./components/CourtroomGrid";
import AddCourtroomModal from "./components/AddCourtroomModal";
import ConfirmModal from "./components/ConfirmModal";
import Loader from "./components/Loader";
import { pluralizeCzech } from "./utils/dateUtils";

function App() {
  const {
    courtrooms,
    loading,
    error,
    fetchCourtrooms,
    createCourtroom,
    deleteCourtroom,
    uploadSchedule,
    removeSchedule,
    removeAllSchedules,
  } = useCourtrooms();

  const [advancedMode, setAdvancedMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveAllConfirm, setShowRemoveAllConfirm] = useState(false);
  const [removingAll, setRemovingAll] = useState(false);
  const [removeAllError, setRemoveAllError] = useState<string | null>(null);

  const handleRemoveAll = async () => {
    setRemovingAll(true);
    setRemoveAllError(null);

    const result = await removeAllSchedules();

    setRemovingAll(false);

    if (!result.success) {
      setRemoveAllError(result.error ?? "Odstranění dokumentů se nezdařilo.");
      return;
    }

    setShowRemoveAllConfirm(false);
  };

  return (
    <div className="app-shell">
      <Header />

      <div className="toolbar">
        <span className="toolbar__count">
          {loading ? "" : `${courtrooms.length} ${pluralizeCzech(courtrooms.length, "jednací síň", "jednací síně", "jednacích síní")}`}
        </span>
        <div className="toolbar__actions">
          <label className="toggle-row">
            <span className="toggle">
              <input
                type="checkbox"
                checked={advancedMode}
                onChange={(e) => setAdvancedMode(e.target.checked)}
              />
              <span className="toggle__track" />
            </span>
            Pokročilé možnosti
          </label>

          <button
            className="btn btn-danger-outline"
            onClick={() => setShowRemoveAllConfirm(true)}
            disabled={loading || courtrooms.length === 0}
          >
            Odstranit všechny dokumenty
          </button>
        </div>
      </div>

      <main className="main">
        {loading && <Loader label="Načítání jednacích síní…" />}

        {!loading && error && (
          <div className="empty-state">
            <div className="empty-state__title">{error}</div>
            <button className="btn btn-outline" onClick={fetchCourtrooms} style={{ marginTop: 12 }}>
              Zkusit znovu
            </button>
          </div>
        )}

        {!loading && !error && (
          <CourtroomGrid
            courtrooms={courtrooms}
            advancedMode={advancedMode}
            onAddCourtroom={() => setShowAddModal(true)}
            uploadSchedule={uploadSchedule}
            removeSchedule={removeSchedule}
            deleteCourtroom={deleteCourtroom}
          />
        )}
      </main>

      {showAddModal && (
        <AddCourtroomModal onClose={() => setShowAddModal(false)} createCourtroom={createCourtroom} />
      )}

      {showRemoveAllConfirm && (
        <ConfirmModal
          title="Odstranit všechny dokumenty"
          message="Tímto odstraníte nahraný dokument ze všech jednacích síní. Tuto akci nelze vrátit zpět."
          confirmLabel="Odstranit vše"
          danger
          loading={removingAll}
          error={removeAllError}
          onConfirm={handleRemoveAll}
          onCancel={() => setShowRemoveAllConfirm(false)}
        />
      )}
    </div>
  );
}

export default App;