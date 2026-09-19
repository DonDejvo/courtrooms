export const pluralizeCzech = (count: number, one: string, few: string, many: string) => {
    if (count === 1) return one;
    if (count >= 2 && count <= 4) return few;
    return many;
};

export const formatDate = (value: string) => {
    const date = new Date(value);

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMinutes < 1) return "Nyní";

    if (diffMinutes < 60) {
        return `Před ${diffMinutes} ${pluralizeCzech(diffMinutes, "minutou", "minutami", "minutami")}`;
    }

    if (diffHours < 24) {
        return `Před ${diffHours} ${pluralizeCzech(diffHours, "hodinou", "hodinami", "hodinami")}`;
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}.${month}.`;
};