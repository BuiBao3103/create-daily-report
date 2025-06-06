import { Intern } from "@/interfaces/intern.types";

export interface InternsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Intern[];
} 