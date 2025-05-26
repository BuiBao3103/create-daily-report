import { Intern, InternsResponse } from '@/Utils/types/intern.types';
import axios from './baseAxios';

const BASECHAT_URL = 'https://dc96-210-245-33-111.ngrok-free.app/webhook/chat';
export const internService = {
  getInterns: async (): Promise<InternsResponse> => {
    const response = await axios.get<InternsResponse>(`${BASECHAT_URL}/interns/`);
    return response.data;
  },
};
