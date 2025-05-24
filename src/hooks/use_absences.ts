import baseAxios from "@/api/baseAxios";
import { Absence, AbsencesResponse } from "@/interfaces/absence.types";
import { useMutation, useQuery, UseQueryOptions, useQueryClient } from "@tanstack/react-query";

const ENDPOINT = "/api/absences/";

export default function useAbsences({
    options,
    params
}: {
    options?: Partial<UseQueryOptions<AbsencesResponse, Error>>,
    params?: string
} = {}) {
    return useQuery<AbsencesResponse, Error>({
        queryKey: [ENDPOINT, params],
        queryFn: async () => {
            const response = await baseAxios.get(ENDPOINT + params);
            return response.data;
        },
        ...options
    });
}

export function useAbsenceMutations() {
    const queryClient = useQueryClient();

    const addAbsence = useMutation<Absence, Error, Omit<Absence, 'id'>>({
        mutationFn: async (absence) => {
            const response = await baseAxios.post(ENDPOINT, absence);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ENDPOINT] });
        }
    });

    const deleteAbsence = useMutation<void, Error, number>({
        mutationFn: async (id) => {
            await baseAxios.delete(`${ENDPOINT}${id}/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ENDPOINT] });
        }
    });

    return { addAbsence, deleteAbsence };
}
