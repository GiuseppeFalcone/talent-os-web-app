import { inject, Injectable } from '@angular/core';
import { ManageUserClient, GetUsersParams } from '../client/manage-user-client';
import { Observable, map } from 'rxjs';
import { PagedResponseDto } from '../../response/paged-model';
import { UserLightDto } from '../../dashboard/model/user-light-dto';
import { CreateUserDto } from '../model/create-user-dto';
import { UserDto } from '../../dashboard/model/user-dto';
import { Credential } from '../../auth/model/credential';

@Injectable({
  providedIn: 'root',
})
export class ManageUserService {
  private readonly client = inject(ManageUserClient);

  getUsers(params: GetUsersParams): Observable<PagedResponseDto<UserLightDto>> {
    return this.client.getUsers(params).pipe(map((res) => res.data));
  }

  getUserById(userId: number): Observable<UserDto> {
    return this.client.getUserById(userId).pipe(map((res) => res.data));
  }

  createUser(createUserDto: CreateUserDto): Observable<Credential> {
    return this.client.createUser(createUserDto).pipe(map((res) => res.data));
  }

  updateUser(userId: number, userDto: UserDto): Observable<UserDto> {
    return this.client.updateUser(userId, userDto).pipe(map((res) => res.data));
  }

  deleteUser(userId: number): Observable<void> {
    return this.client.deleteUser(userId).pipe(map((res) => res.data));
  }

  resetPassword(credential: Credential): Observable<void> {
    return this.client.resetPassword(credential).pipe(map((res) => res.data));
  }
}
