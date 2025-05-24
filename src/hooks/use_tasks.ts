import baseAxios from "@/api/baseAxios";
import { Task, TasksResponse } from "@/interfaces/task.types";
import { useMutation, UseMutationOptions, useQuery, UseQueryOptions, useQueryClient } from "@tanstack/react-query";

const ENDPOINT = "/api/tasks/";

export default function useTask({
    options,
    params
}: {
    options?: Partial<UseQueryOptions<TasksResponse, Error>>,
    params?: string
} = {}) {
    return useQuery<TasksResponse, Error>({
        queryKey: [ENDPOINT, params],
        queryFn: async () => {
            const response = await baseAxios.get(ENDPOINT + params);
            return response.data;
        },
        ...options
    });
}

export function useTaskMutations() {

    const addTask = useMutation<Task, Error, Task>({
        mutationKey: ['addTask'],
        mutationFn: async (task) => {
            const cleanedTask = {
                ...task,
                act_time: task.status === 'Done' ? task.act_time : undefined,
                est_time: task.est_time || undefined,
            };
            const response = await baseAxios.post(ENDPOINT, cleanedTask);
            return response.data;
        },
        onSuccess: () => {
        }
    });

    const updateTask = useMutation<Task, Error, Task>({
        mutationKey: ['updateTask'],
        mutationFn: async (task) => {
            const cleanedTask = {
                ...task,
                act_time: task.status === 'Done' ? task.act_time : undefined,
                est_time: task.est_time ?? undefined,
            };
            const response = await baseAxios.put(`${ENDPOINT}${task.id}/`, cleanedTask);
            return response.data;
        },
        onSuccess: () => {
        }
    });

    const deleteTask = useMutation<void, Error, number>({
        mutationKey: ['deleteTask'],
        mutationFn: async (id) => {
            await baseAxios.delete(`${ENDPOINT}${id}/`);
        },
        onSuccess: () => {
        }
    });

    return { addTask, updateTask, deleteTask };
}