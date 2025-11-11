import { UserLighDto } from '../user/user-light-dto';

export interface LoginResponse {
  userLighDto: UserLighDto;
  accessToken: string;
  refreshToken: string;
}
