import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { AuthService } from '../../auth/service/auth-service';
import { YourCvClient } from '../client/your-cv-client';
import { CurriculumDetailDto } from '../model/curriculum-detail-dto';

@Injectable({
  providedIn: 'root',
})
export class YourCvService {
  private readonly cvClient = inject(YourCvClient);
  private readonly authService = inject(AuthService);

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
}
