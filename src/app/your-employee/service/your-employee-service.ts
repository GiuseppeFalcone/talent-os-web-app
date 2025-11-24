import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { YourEmployeeClient } from '../client/your-employee-client';
import { CurriculumAndUserLightDto } from '../model/curriculum-and-user-light-dto';
import { PagedResponseDto } from '../../response/paged-model';
import { UserRoleEnum } from '../../enumeration/user-role-enum';
import { ManageDomainService } from '../../manage-domain/service/manage-domain-service';
import { DomainDto } from '../../manage-domain/model/domain-dto';

@Injectable({
  providedIn: 'root',
})
export class YourEmployeeService {
  private readonly client = inject(YourEmployeeClient);
  private readonly domainService = inject(ManageDomainService);

  getEmployees(
    page: number,
    pageSize: number,
    filters?: { searchString?: string; queryRole?: UserRoleEnum; domainOptionIds?: number[] }
  ): Observable<PagedResponseDto<CurriculumAndUserLightDto>> {
    return this.client
      .getUsersAndCurriculums({
        page,
        pageSize,
        searchString: filters?.searchString,
        queryRole: filters?.queryRole,
        domainOptionIds: filters?.domainOptionIds,
      })
      .pipe(map((res) => res.data));
  }

  getAllDomains(): Observable<DomainDto[]> {
    return this.domainService.getDomains({ page: 1, pageSize: 100 }).pipe(
      switchMap((response) => {
        const firstPageDomains = response.content;

        if (response.page.totalPages <= 1) {
          return of(firstPageDomains);
        }

        const remainingPageRequests = [];
        for (let page = 2; page <= response.page.totalPages; page++) {
          remainingPageRequests.push(
            this.domainService.getDomains({ page, pageSize: 100 }).pipe(map((res) => res.content))
          );
        }

        return forkJoin(remainingPageRequests).pipe(
          map((remainingPages) => {
            return [firstPageDomains, ...remainingPages].flat();
          })
        );
      })
    );
  }
}
