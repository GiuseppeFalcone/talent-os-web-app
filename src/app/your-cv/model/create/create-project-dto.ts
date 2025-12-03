import { CreateProjectDomainOptionDto } from './create-project-domain-option-dto';

export interface CreateProjectDto {
  startDate: string;
  endDate?: string;
  description: string;
  domainOptions?: CreateProjectDomainOptionDto[];
}
