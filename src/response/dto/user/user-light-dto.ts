import { UserRoleEnum } from '../../../enumeration/user-role-enum';

export interface UserLighDto {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRoleEnum;
  refreshToken: string;
}
