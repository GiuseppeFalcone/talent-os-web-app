import { ProjectDomainOptionDto } from './project-domain-option-dto';

export interface ProjectDto {
  projectId?: number;
  startDate: string;
  endDate?: string;
  description: string;
  domainOptions?: ProjectDomainOptionDto[];
}
