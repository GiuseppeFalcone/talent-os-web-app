import { DrivingLicenseEnum } from '../enum/driving-license-enum';
import { EducationDto } from './education-dto';
import { ProjectDomainOptionDto } from './project-domain-option-dto';
import { ProjectDto } from './project-dto';

export interface CurriculumDto {
  curriculumId: number;
  userId: number;
  mobilePhone?: string;
  homeAddress?: string;
  workAddress?: string;
  maritalStatus?: boolean;
  drivingLicense?: DrivingLicenseEnum;
  hasCar?: boolean;
  openForTravel?: boolean;
  summary?: string;
  lastModifiedAt?: string;
  educationHistory?: EducationDto[];
  projects?: ProjectDto[];
  domainOptions?: ProjectDomainOptionDto[];
}
