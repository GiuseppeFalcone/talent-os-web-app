import { UserRoleEnum } from '../../enumeration/user-role-enum';

export interface UserLightDto {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRoleEnum;
  email: string;
  refreshToken: string;
}
