import { UserRoleEnum } from '../../enumeration/user-role-enum';
import { UserDomainOptionDto } from './user-domain-option-dto';

export interface UserDto {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRoleEnum;
  email: string;
  managerId: number;
  employeeIds: number[];
  userDomainOptions: UserDomainOptionDto[];
}
