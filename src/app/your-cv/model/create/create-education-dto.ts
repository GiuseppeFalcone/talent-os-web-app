export interface CreateEducationDto {
  schoolNameId?: number;
  degreeNameId?: number;
  grade?: number;
  maxGrade?: number;
  startDate: string;
  endDate?: string;
}
