import { AbsenceType } from './DailyReportForm.types';

export interface Absence {
    id: number;
    date: string;
    type: AbsenceType;
    reason: string;
    intern: number;
}

export interface AbsencesResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Absence[];
} 