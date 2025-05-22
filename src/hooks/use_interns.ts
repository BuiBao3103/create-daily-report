import baseAxios from "@/api/baseAxios";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { InternsResponse } from "@/interfaces/intern.types";

const ENDPOINT = "/api/interns/";

export default function useInterns({
    options,
    params = ''
}: {
    options?: Partial<UseQueryOptions<InternsResponse, Error>>,
    params?: string
} = {}) {
    return useQuery<InternsResponse, Error>({
        queryKey: [ENDPOINT, params],
        queryFn: async () => {
            const response = await baseAxios.get(ENDPOINT + params);
            return response.data;
        },
        ...options
    });
}
