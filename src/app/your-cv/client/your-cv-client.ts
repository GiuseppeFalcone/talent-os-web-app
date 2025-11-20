import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedResponseDto } from '../../response/paged-model';
import { CurriculumDetailDto } from '../model/curriculum-detail-dto';
import { CurriculumDto } from '../model/curriculum-dto';
import { CurriculumLightDto } from '../model/curriculum-light-dto';
import { UserDto } from '../../dashboard/model/user-dto';

export interface GetCurriculumsParams {
  page: number;
  pageSize: number;
  userIds?: number[];
  domainId?: number;
  domainOptionId?: number;
}

@Injectable({
  providedIn: 'root',
})
export class YourCvClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/bff-web-app/curriculums';

  getCurriculums(
    params: GetCurriculumsParams
  ): Observable<ApiResponse<PagedResponseDto<CurriculumLightDto>>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.userIds && params.userIds.length > 0) {
      params.userIds.forEach((id) => {
        httpParams = httpParams.append('userIds', id.toString());
      });
    }
    if (params.domainId) {
      httpParams = httpParams.set('domainId', params.domainId.toString());
    }
    if (params.domainOptionId) {
      httpParams = httpParams.set('domainOptionId', params.domainOptionId.toString());
    }

    return this.http.get<ApiResponse<PagedResponseDto<CurriculumLightDto>>>(this.baseUrl, {
      params: httpParams,
    });
  }

  getCurriculumById(curriculumId: number): Observable<ApiResponse<CurriculumDto>> {
    const url = `${this.baseUrl}/${curriculumId}`;
    return this.http.get<ApiResponse<CurriculumDto>>(url);
  }

  getCurriculumDetailsById(curriculumId: number): Observable<ApiResponse<CurriculumDetailDto>> {
    const url = `${this.baseUrl}/${curriculumId}/details`;
    return this.http.get<ApiResponse<CurriculumDetailDto>>(url);
  }

  updateCurriculum(
    curriculumId: number,
    curriculumDto: CurriculumDto,
    userDto: UserDto
  ): Observable<ApiResponse<CurriculumDetailDto>> {
    const url = `${this.baseUrl}/${curriculumId}`;
    return this.http.put<ApiResponse<CurriculumDetailDto>>(url, {
      curriculum: curriculumDto,
      user: userDto,
    });
  }
}
