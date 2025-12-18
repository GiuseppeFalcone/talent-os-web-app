import { UserLightDto } from '../../dashboard/model/user-light-dto';

export interface LoginResponse {
  userLightDto: UserLightDto;
  accessToken: string;
  refreshToken: string;
}
