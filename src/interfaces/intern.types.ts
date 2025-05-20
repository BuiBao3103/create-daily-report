export interface Intern {
  id: number;
  full_name: string;
  uni_code: string;
}

export interface InternsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Intern[];
} 