interface LoaderProps {
    label?: string;
}

const Loader = ({ label = "Načítání…" }: LoaderProps) => {
    return (
        <div className="loader">
            <div className="loader__spinner" />
            <span>{label}</span>
        </div>
    );
};

export default Loader;