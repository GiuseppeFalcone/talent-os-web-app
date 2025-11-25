import { UserDto } from '../../../dashboard/model/user-dto';
import { CreateCurriculumDto } from './create-curriculum-dto';

export interface CreateCurriculumDetailDto {
  createCurriculumDto: CreateCurriculumDto;
  userDto: UserDto;
}
