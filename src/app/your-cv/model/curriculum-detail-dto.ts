import { UserDto } from '../../dashboard/model/user-dto';
import { DomainDto } from '../../manage-domain/model/domain-dto';
import { CurriculumDto } from './curriculum-dto';

export interface CurriculumDetailDto {
  user: UserDto;
  curriculum: CurriculumDto;
  domains: DomainDto[];
}
