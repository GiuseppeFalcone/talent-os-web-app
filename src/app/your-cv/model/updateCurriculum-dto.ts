import { UserDto } from '../../dashboard/model/user-dto';
import { CurriculumDto } from './curriculum-dto';

export interface UpdateCurriculumDto {
  curriculum: CurriculumDto;
  user: UserDto;
}
