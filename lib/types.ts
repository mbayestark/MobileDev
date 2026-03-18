export type Priority = "high" | "medium" | "low";

export type RepeatOption = "none" | "daily" | "weekly";

export type Task = {
    id: string;
    title: string;
    completed: boolean;
    listId: string;
    myDay: boolean;
    priority: Priority;
    dueDate?: string;
    dueTime?: string;
    reminder?: string;
    notes?: string;
    repeat: RepeatOption;
    notificationId?: string;
    createdAt: string;
};

export type TaskList = {
    id: string;
    name: string;
    color: string;
    emoji?: string;
    isDefault: boolean;
};


