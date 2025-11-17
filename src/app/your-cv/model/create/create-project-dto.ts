import { CreateProjectDomainOptionDto } from './create-project-domain-option-dto';

export interface CreateProjectDto {
  startDate: string; // Serialized LocalDate
  endDate?: string; // Serialized LocalDate
  description: string;
  domainOptions?: CreateProjectDomainOptionDto[];
}
