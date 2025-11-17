import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserLightDto } from '../model/user-light-dto';
import { UserDto } from '../model/user-dto';

@Injectable({
  providedIn: 'root',
})
export class DashboardClient {
  private readonly http = inject(HttpClient);
}
