export interface EducationDto {
  educationId?: number;
  schoolNameId?: number;
  degreeNameId?: number;
  grade?: number;
  maxGrade?: number;
  startDate: string; // Serialized LocalDate
  endDate?: string; // Serialized LocalDate
}
