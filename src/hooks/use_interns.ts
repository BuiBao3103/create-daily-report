import baseAxios from "@/api/baseAxios";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { InternsResponse } from "@/types/intern.types";

const ENDPOINT = "/api/interns/";
export default function useInterns({
    options,
    params
}: {
    options?: Partial<UseQueryOptions<InternsResponse, Error>>,
    params?: string
} = {}) {
    const query = useQuery<InternsResponse>({
        queryKey: [ENDPOINT + params],
        queryFn: async () => {
            const response = await baseAxios.get(ENDPOINT + params);
            console.log(response.data);
            return response.data || [];
        },
        ...options
    })
    return query;
}
