import baseAxios from "@/api/baseAxios";
import { Task, TasksResponse } from "@/interfaces/task.types";
import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from "@tanstack/react-query";

const ENDPOINT = "/api/tasks/";

export default function useTask({
    options,
    params
}: {
    options?: Partial<UseQueryOptions<TasksResponse, Error>>,
    params?: string
} = {}) {
    const query = useQuery<TasksResponse>({
        queryKey: [ENDPOINT, params],
        queryFn: async () => {
            const response = await baseAxios.get(ENDPOINT + params);
            return response.data
        },
        ...options
    });
    return query;
}

export function useTaskMutations() {
    const addTask = useMutation({
        mutationFn: async (task: Task) => {
            const res = await baseAxios.post(ENDPOINT, task);
            return res.data;
        }
    });

    const updateTask = useMutation({
        mutationFn: async (task: Task) => {
            const res = await baseAxios.put(`${ENDPOINT}${task.id}/`, task);
            return res.data;
        }
    });

    const deleteTask = useMutation({
        mutationFn: async (id: number) => {
            const res = await baseAxios.delete(`${ENDPOINT}${id}/`);
            return res.data;
        }
    });

    return {
        addTask,
        updateTask,
        deleteTask
    };
}