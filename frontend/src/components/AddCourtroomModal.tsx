import { useState } from "react";

const CODE_PATTERN = /^([a-z0-9]+-)*[a-z0-9]+$/i;

interface AddCourtroomModalProps {
    onClose: () => void;
    createCourtroom: (code: string) => Promise<{ success: boolean; error?: string }>;
}

const AddCourtroomModal = ({ onClose, createCourtroom }: AddCourtroomModalProps) => {
    const [code, setCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const validate = (): string | null => {
        if (code.length < 1 || code.length > 20) {
            return "Kód musí mít 1 až 20 znaků.";
        }
        if (!CODE_PATTERN.test(code)) {
            return "Kód může obsahovat pouze písmena, čísla a pomlčky.";
        }
        return null;
    };

    const handleSubmit = async () => {
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setSaving(true);
        setError(null);

        const result = await createCourtroom(code);

        setSaving(false);

        if (!result.success) {
            setError(result.error ?? "Vytvoření jednací síně se nezdařilo.");
            return;
        }

        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3 className="modal__title">Přidat jednací síň</h3>
                <p className="modal__message">Zaregistrujte novou jednací síň pomocí jejího kódu.</p>

                <div className="field">
                    <label htmlFor="courtroom-code">Kód</label>
                    <input
                        id="courtroom-code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        disabled={saving}
                    />
                </div>

                {error && <p className="field__error">{error}</p>}

                <div className="modal__actions">
                    <button className="btn btn-ghost" onClick={onClose} disabled={saving}>
                        Zrušit
                    </button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                        {saving ? "Přidávání…" : "Přidat jednací síň"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddCourtroomModal;