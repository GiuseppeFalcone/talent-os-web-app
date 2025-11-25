import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PagedResponseDto } from '../../response/paged-model';
import { GetDomainsParams, ManageDomainClient } from '../client/manage-domain-client';
import { DomainDto } from '../model/domain-dto';
import { CreateDomainDto } from '../model/create-domain-dto';

@Injectable({
  providedIn: 'root',
})
export class ManageDomainService {
  private readonly domainClient = inject(ManageDomainClient);

  getDomains(params: GetDomainsParams): Observable<PagedResponseDto<DomainDto>> {
    return this.domainClient.getDomains(params).pipe(map((response) => response.data));
  }

  getDomainById(domainId: number): Observable<DomainDto> {
    return this.domainClient.getDomainById(domainId).pipe(map((response) => response.data));
  }

  createDomain(dto: CreateDomainDto): Observable<DomainDto> {
    return this.domainClient.createDomain(dto).pipe(map((response) => response.data));
  }

  updateDomain(domainId: number, dto: DomainDto): Observable<DomainDto> {
    return this.domainClient.updateDomain(domainId, dto).pipe(map((response) => response.data));
  }

  deleteDomain(domainId: number): Observable<void> {
    return this.domainClient.deleteDomain(domainId).pipe(map((response) => response.data));
  }
}
