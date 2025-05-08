import axios from './baseAxios';
import { Intern, InternsResponse } from '@/Utils/types/intern.types';

const BASE_URL = 'http://127.0.0.1:8000/api';

export const internService = {
  getInterns: async (): Promise<InternsResponse> => {
    const response = await axios.get<InternsResponse>(`${BASE_URL}/interns/`);
    return response.data;
  }
}; 