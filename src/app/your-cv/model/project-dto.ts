import { ProjectDomainOptionDto } from './project-domain-option-dto';

export interface ProjectDto {
  projectId?: number;
  startDate: string; // Serialized LocalDate
  endDate?: string; // Serialized LocalDate
  description: string;
  domainOptions?: ProjectDomainOptionDto[];
}
