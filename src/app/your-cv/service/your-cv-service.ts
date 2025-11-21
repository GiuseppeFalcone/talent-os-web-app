import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { DomainDto } from '../../manage-domain/model/domain-dto';
import { AuthService } from '../../auth/service/auth-service';
import { YourCvClient } from '../client/your-cv-client';
import type { CurriculumDetailDto } from '../model/curriculum-detail-dto';
import { ManageDomainService } from '../../manage-domain/service/manage-domain-service';
import { CurriculumDto } from '../model/curriculum-dto';
import { UserDto } from '../../dashboard/model/user-dto';

@Injectable({
  providedIn: 'root',
})
export class YourCvService {
  private readonly cvClient = inject(YourCvClient);
  private readonly authService = inject(AuthService);
  private readonly domainService = inject(ManageDomainService);

  getCurriculumDetailsForCurrentUser(): Observable<CurriculumDetailDto> {
    const currentUserId = this.authService.currentUser()?.userId;

    if (!currentUserId) {
      return throwError(() => new Error('User not logged in or user ID not available.'));
    }

    const params = {
      page: 1,
      pageSize: 1,
      userIds: [currentUserId],
    };

    return this.cvClient.getCurriculums(params).pipe(
      switchMap((pagedResponse) => {
        const curriculumId = pagedResponse.data.content[0]?.curriculumId;

        if (!curriculumId) {
          return throwError(() => new Error('No curriculum found for the current user.'));
        }
        return this.cvClient.getCurriculumDetailsById(curriculumId);
      }),
      map((curriculumDetailResponse) => {
        return curriculumDetailResponse.data;
      })
    );
  }

  getCurriculumDetailsByUserId(userId: number): Observable<CurriculumDetailDto> {
    const params = {
      page: 1,
      pageSize: 1,
      userIds: [userId],
    };

    return this.cvClient.getCurriculums(params).pipe(
      switchMap((pagedResponse) => {
        const curriculumId = pagedResponse.data.content[0]?.curriculumId;

        if (!curriculumId) {
          return throwError(() => new Error('No curriculum found for this user.'));
        }
        return this.cvClient.getCurriculumDetailsById(curriculumId);
      }),
      map((curriculumDetailResponse) => {
        return curriculumDetailResponse.data;
      })
    );
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

  updateCurriculum(
    curriculumId: number,
    curriculumDto: CurriculumDto,
    userDto: UserDto
  ): Observable<CurriculumDetailDto> {
    return this.cvClient.updateCurriculum(curriculumId, curriculumDto, userDto).pipe(
      map((response) => response.data),
      catchError((error) => {
        return throwError(() => new Error('Failed to update curriculum'));
      })
    );
  }
}
