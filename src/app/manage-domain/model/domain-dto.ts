import { DomainOptionDto } from './domain-option-dto';

export interface DomainDto {
  domainId: number;
  domainName: string;
  domainOptions: DomainOptionDto[];
}
