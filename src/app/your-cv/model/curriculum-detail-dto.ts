import { UserDto } from '../../dashboard/model/user-dto';
import { DomainDto } from '../../manage-domain/model/domain-dto';
import { DomainOptionDto } from '../../manage-domain/model/domain-option-dto';
import { CurriculumDto } from './curriculum-dto';

export interface CurriculumDetailDto {
  user: UserDto;
  curriculum: CurriculumDto;
  domains: DomainDto[];
  schools: DomainOptionDto[];
  degrees: DomainOptionDto[];
}
