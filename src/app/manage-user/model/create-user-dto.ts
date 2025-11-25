import { UserRoleEnum } from '../../enumeration/user-role-enum';

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  role: UserRoleEnum;
  email: string;
  managerId?: number;
}
