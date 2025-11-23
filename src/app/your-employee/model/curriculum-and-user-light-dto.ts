import { UserRoleEnum } from '../../enumeration/user-role-enum';

export interface CurriculumAndUserLightDto {
  curriculumId: number;
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRoleEnum; // Consider using an enum if UserRoleEnum is defined elsewhere
  hasCar: boolean;
  openForTravel: boolean;
  numberOfProjects: number;
  hasDegree: boolean;
}
