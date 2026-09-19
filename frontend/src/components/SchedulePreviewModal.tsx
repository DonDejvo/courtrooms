interface SchedulePreviewModalProps {
    title: string;
    url: string;
    onClose: () => void;
}

const SchedulePreviewModal = ({ title, url, onClose }: SchedulePreviewModalProps) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
                <div className="preview-modal__header">
                    <h3 className="modal__title" style={{ margin: 0 }}>
                        dokument — {title}
                    </h3>
                    <button className="btn btn-ghost btn-sm" onClick={onClose}>
                        Zavřít
                    </button>
                </div>
                <img src={url} alt={`dokument pro ${title}`} />
            </div>
        </div>
    );
};

export default SchedulePreviewModal;