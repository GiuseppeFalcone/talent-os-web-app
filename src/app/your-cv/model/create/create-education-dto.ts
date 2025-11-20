export interface CreateEducationDto {
  schoolNameId?: number;
  degreeNameId?: number;
  grade?: number;
  maxGrade?: number;
  startDate: string; // Serialized LocalDate
  endDate?: string; // Serialized LocalDate
}
