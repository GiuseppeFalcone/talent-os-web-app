import { DrivingLicenseEnum } from '../../enum/driving-license-enum';
import { CreateEducationDto } from './create-education-dto';
import { CreateProjectDomainOptionDto } from './create-project-domain-option-dto';
import { CreateProjectDto } from './create-project-dto';

export interface CreateCurriculumDto {
  mobilePhone?: string;
  homeAddress?: string;
  workAddress?: string;
  maritalStatus?: boolean;
  drivingLicense?: DrivingLicenseEnum;
  hasCar?: boolean;
  openForTravel?: boolean;
  summary?: string;
  educationHistory?: CreateEducationDto[];
  projects?: CreateProjectDto[];
  domainOptions?: CreateProjectDomainOptionDto[];
}
