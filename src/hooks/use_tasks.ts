import baseAxios from "@/api/baseAxios";
import { TasksResponse } from "@/interfaces/task.types";
import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from "@tanstack/react-query";

const ENDPOINT = "/api/tasks/";
export interface Taskdaily {
    task_id?: string
    content: string
    project?: string
    est_time?: number
    act_time?: number
    status: string
    date?: string
    intern?: number | null
}

export default function useTask({
    options,
    params
}: {
    options?: Partial<UseQueryOptions<TasksResponse, Error>>,
    params?: string
} = {}) {
    const query = useQuery<TasksResponse>({
        queryKey: [ENDPOINT + params],
        queryFn: async () => {
            const response = await baseAxios.get(ENDPOINT + params);
            return response.data
        },
        ...options
    });
    return query;
} 

export function addOrCreateTask({options}: { options?: UseMutationOptions<any, Error, Taskdaily[], unknown> } = {}) {
    const mutation = useMutation({
        mutationFn: async (body: Taskdaily[]) => 
        {
            const res = await baseAxios.post(ENDPOINT, body);
            return res
        },
        ...options
    })
    return mutation
}