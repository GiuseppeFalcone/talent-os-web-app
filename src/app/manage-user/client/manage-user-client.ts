import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Credential } from '../../auth/model/credential';
import { UserDto } from '../../dashboard/model/user-dto';
import { UserLightDto } from '../../dashboard/model/user-light-dto';
import { UserRoleEnum } from '../../enumeration/user-role-enum';
import { PagedResponseDto } from '../../response/paged-model';
import { CreateUserDto } from '../model/create-user-dto';

export interface GetUsersParams {
  page: number;
  pageSize: number;
  searchString?: string;
  queryRole?: UserRoleEnum;
}

@Injectable({
  providedIn: 'root',
})
export class ManageUserClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/bff-web-app/users';

  getUsers(params: GetUsersParams): Observable<ApiResponse<PagedResponseDto<UserLightDto>>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.searchString) {
      httpParams = httpParams.set('searchString', params.searchString);
    }
    if (params.queryRole !== undefined && params.queryRole !== null) {
      httpParams = httpParams.set('queryRole', params.queryRole.toString());
    }

    return this.http.get<ApiResponse<PagedResponseDto<UserLightDto>>>(this.baseUrl, {
      params: httpParams,
    });
  }

  getUserById(userId: number): Observable<ApiResponse<UserDto>> {
    return this.http.get<ApiResponse<UserDto>>(`${this.baseUrl}/${userId}`);
  }

  createUser(createUserDto: CreateUserDto): Observable<ApiResponse<Credential>> {
    return this.http.post<ApiResponse<Credential>>(this.baseUrl, createUserDto);
  }

  updateUser(userId: number, userDto: UserDto): Observable<ApiResponse<UserDto>> {
    return this.http.put<ApiResponse<UserDto>>(`${this.baseUrl}/${userId}`, userDto);
  }

  deleteUser(userId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${userId}`);
  }

  resetPassword(credential: Credential): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/password`, credential);
  }
}
