
export enum AbsenceType {
  EXCUSED = 'EXCUSED',
  UNEXCUSED = 'UNEXCUSED',
  SCHEDULED = 'SCHEDULED',
}

export interface Absence {
  type: AbsenceType;
  reason: string;
}


