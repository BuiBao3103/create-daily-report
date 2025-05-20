import baseAxios from "@/api/baseAxios";
import { TasksResponse } from "@/interfaces/task.types";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";



const ENDPOINT = "/api/tasks/";

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