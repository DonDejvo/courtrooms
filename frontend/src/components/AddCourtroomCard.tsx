interface AddCourtroomCardProps {
    onClick: () => void;
}

const AddCourtroomCard = ({ onClick }: AddCourtroomCardProps) => {
    return (
        <button className="add-card" onClick={onClick} type="button">
            <span className="add-card__icon">+</span>
            <span>Přidat jednací síň</span>
        </button>
    );
};

export default AddCourtroomCard;