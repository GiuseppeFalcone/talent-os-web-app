import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedResponseDto } from '../../response/paged-model';
import { DomainDto } from '../model/domain-dto';
import { CreateDomainDto } from '../model/create-domain-dto';

export interface GetDomainsParams {
  page: number;
  pageSize: number;
  domainName?: string;
  domainOptionValue?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ManageDomainClient {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = 'http://localhost:8080/api/bff-web-app/domains';

  getDomains(params: GetDomainsParams): Observable<ApiResponse<PagedResponseDto<DomainDto>>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.domainName) {
      httpParams = httpParams.set('domainName', params.domainName);
    }
    if (params.domainOptionValue) {
      httpParams = httpParams.set('domainOptionValue', params.domainOptionValue);
    }

    return this.http.get<ApiResponse<PagedResponseDto<DomainDto>>>(this.baseUrl, {
      params: httpParams,
    });
  }

  getDomainById(domainId: number): Observable<ApiResponse<DomainDto>> {
    const url = `${this.baseUrl}/${domainId}`;
    return this.http.get<ApiResponse<DomainDto>>(url);
  }

  createDomain(dto: CreateDomainDto): Observable<ApiResponse<DomainDto>> {
    return this.http.post<ApiResponse<DomainDto>>(this.baseUrl, dto);
  }

  updateDomain(domainId: number, dto: DomainDto): Observable<ApiResponse<DomainDto>> {
    const url = `${this.baseUrl}/${domainId}`;
    return this.http.put<ApiResponse<DomainDto>>(url, dto);
  }

  deleteDomain(domainId: number): Observable<ApiResponse<void>> {
    const url = `${this.baseUrl}/${domainId}`;
    return this.http.delete<ApiResponse<void>>(url);
  }
}
