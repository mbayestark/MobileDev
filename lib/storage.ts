import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task, TaskList } from "./types";
import { DEFAULT_LISTS } from "../constants/defaultLists";


const TASKS_KEY = "taskman_tasks";
const LIST_KEYS = "tasman_lists";

// TASKS

export async function getTasks(): Promise<Task[]> {
    try {
        const json = await AsyncStorage.getItem(TASKS_KEY);
        return json ? JSON.parse(json) : [];
    } catch {
        return [];
    }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
    try {
        await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (e) {
        console.error("Failed to save tasks", e);
    }
}

export async function addTask(task: Task): Promise<void> {
    const tasks = await getTasks();
    await saveTasks([...tasks, task]);
}

export async function updateTask(updated: Task): Promise<void> {
    const tasks = await getTasks();
    await saveTasks(tasks.map(t => (t.id == updated.id ? updated : t)));
}

export async function deleteTask(id: string): Promise<void> {
    const tasks = await getTasks();
    await saveTasks(tasks.filter(t => t.id !== id));
}

//LISTS

export async function getLists(): Promise<TaskList[]> {
    try {
        const json = await AsyncStorage.getItem(LIST_KEYS);
        return json ? JSON.parse(json) : DEFAULT_LISTS;
    } catch {
        return DEFAULT_LISTS;
    }
}

export async function saveLists(lists: TaskList[]): Promise<void> {
    try {
        await AsyncStorage.setItem(LIST_KEYS, JSON.stringify(lists));
    } catch (e) {
        console.error("Failed to save lists", e);
    }
}

export async function addList(list: TaskList): Promise<void> {
    const lists = await getLists();
    await saveLists([...lists, list]);
}

export async function updateList(updated: TaskList): Promise<void> {
    const lists = await getLists();
    await saveLists(lists.map(l => (l.id == updated.id ? updated : l)));
}

export async function deleteList(id: string): Promise<void> {
    const lists = await getLists();
    await saveLists(lists.filter(l => l.id !== id));
}