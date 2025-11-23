import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedResponseDto } from '../../response/paged-model';
import { CurriculumAndUserLightDto } from '../model/curriculum-and-user-light-dto';
import { UserRoleEnum } from '../../enumeration/user-role-enum';

export interface GetEmployeesParams {
  page: number;
  pageSize: number;
  queryUsername?: string;
  queryRole?: UserRoleEnum;
  domainId?: number;
  domainOptionId?: number;
}

@Injectable({
  providedIn: 'root',
})
export class YourEmployeeClient {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = 'http://localhost:8080/api/bff-web-app/views/your-employees';

  getUsersAndCurriculums(
    params: GetEmployeesParams
  ): Observable<ApiResponse<PagedResponseDto<CurriculumAndUserLightDto>>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.queryUsername) {
      httpParams = httpParams.set('queryUsername', params.queryUsername);
    }
    if (params.queryRole) {
      httpParams = httpParams.set('queryRole', params.queryRole.toString());
    }
    if (params.domainId) {
      httpParams = httpParams.set('domainId', params.domainId.toString());
    }
    if (params.domainOptionId) {
      httpParams = httpParams.set('domainOptionId', params.domainOptionId.toString());
    }

    return this.http.get<ApiResponse<PagedResponseDto<CurriculumAndUserLightDto>>>(this.baseUrl, {
      params: httpParams,
    });
  }
}
