import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { YourCvService } from '../../your-cv/service/your-cv-service';
import { YourEmployeeClient } from '../client/your-employee-client';
import { CurriculumAndUserLightDto } from '../model/curriculum-and-user-light-dto';
import { PagedResponseDto } from '../../response/paged-model';
import { UserRoleEnum } from '../../enumeration/user-role-enum';

@Injectable({
  providedIn: 'root',
})
export class YourEmployeeService {
  private readonly client = inject(YourEmployeeClient);

  getEmployees(
    page: number,
    pageSize: number,
    filters?: { queryUsername?: string; queryRole?: UserRoleEnum }
  ): Observable<PagedResponseDto<CurriculumAndUserLightDto>> {
    return this.client
      .getUsersAndCurriculums({
        page,
        pageSize,
        queryUsername: filters?.queryUsername,
        queryRole: filters?.queryRole,
      })
      .pipe(map((res) => res.data));
  }
}
