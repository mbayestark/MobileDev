import { TaskList } from "../lib/types";

export const DEFAULT_LISTS: TaskList[] = [
    {
        id: "myDay",
        name: "My Day",
        color: "#f0a500",
        emoji: "☀️",
        isDefault: true,
    },
    {
        id: "tasks",
        name: "Tasks",
        color: "#2ecc71",
        emoji: "📋",
        isDefault: true,
    },
    {
        id: "important",
        name: "Important",
        color: "#e74c3c",
        emoji: "⭐",
        isDefault: true,
    },
    {
        id: "planned",
        name: "Planned",
        color: "#4a9eff",
        emoji: "📅",
        isDefault: true,
    },
];