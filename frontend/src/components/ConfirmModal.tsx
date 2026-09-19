interface ConfirmModalProps {
    title: string;
    message: string;
    confirmLabel?: string;
    danger?: boolean;
    loading?: boolean;
    error?: string | null;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal = ({
    title,
    message,
    confirmLabel = "Potvrdit",
    danger = false,
    loading = false,
    error,
    onConfirm,
    onCancel,
}: ConfirmModalProps) => {
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div
                className={`modal ${danger ? "modal--danger" : ""}`}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="modal__title">{title}</h3>
                <p className="modal__message">{message}</p>
                {error && <p className="field__error">{error}</p>}
                <div className="modal__actions">
                    <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>
                        Zrušit
                    </button>
                    <button
                        className={danger ? "btn btn-danger" : "btn btn-primary"}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? "Prosím čekejte…" : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;