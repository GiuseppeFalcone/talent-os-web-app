import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
  ViewChild,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { TableLazyLoadEvent, TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';
import { TitleCasePipe } from '@angular/common';
import { YourEmployeeService } from './service/your-employee-service';
import { CurriculumAndUserLightDto } from './model/curriculum-and-user-light-dto';
import { UserRoleEnum } from '../enumeration/user-role-enum';
import { HttpErrorResponse } from '@angular/common/http';
import { DomainDto } from '../manage-domain/model/domain-dto';
import { AccordionModule } from 'primeng/accordion';
import { Divider } from 'primeng/divider';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-your-employee',
  templateUrl: './your-employee.html',
  styleUrl: './your-employee.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableModule,
    ButtonModule,
    TagModule,
    CardModule,
    ToastModule,
    TitleCasePipe,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    SelectModule,
    IconFieldModule,
    InputIconModule,
    AccordionModule,
    Divider,
  ],
  providers: [MessageService],
})
export class YourEmployee implements OnInit, OnDestroy {
  private readonly yourEmployeeService = inject(YourEmployeeService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  @ViewChild('dt') table!: Table;

  readonly employees = signal<CurriculumAndUserLightDto[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly loading = signal<boolean>(true);

  readonly searchQuery = signal<string>('');
  readonly searchControl = new FormControl('');
  private searchSub?: Subscription;

  readonly selectedRole = signal<UserRoleEnum | null>(null);

  readonly domains = signal<DomainDto[]>([]);
  readonly selectedDomainOptionIds = signal<number[]>([]);

  readonly roleOptions = [
    { label: 'Manager', value: UserRoleEnum.MANAGER },
    { label: 'Employee', value: UserRoleEnum.EMPLOYEE },
    { label: 'Admin', value: UserRoleEnum.ADMIN },
    { label: 'Super Admin', value: UserRoleEnum.SUPERADMIN },
  ];

  private currentPage = 1;
  private pageSize = 10;

  ngOnInit(): void {
    this.loadDomains();
    this.setupSearchSubscription();
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  private setupSearchSubscription(): void {
    this.searchSub = this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.searchQuery.set(value || '');
        this.onFilter();
      });
  }

  private loadDomains(): void {
    this.yourEmployeeService.getAllDomains().subscribe({
      next: (data) => {
        this.domains.set(data);
      },
      error: (err) => {
        console.error('Failed to load domains', err);
      },
    });
  }

  loadData(event: TableLazyLoadEvent) {
    this.loading.set(true);

    const first = event.first ?? 0;
    const rows = event.rows ?? 10;
    this.currentPage = Math.floor(first / rows) + 1;
    this.pageSize = rows;

    this.yourEmployeeService
      .getEmployees(this.currentPage, this.pageSize, {
        searchString: this.searchQuery() || undefined,
        queryRole: this.selectedRole() || undefined,
        domainOptionIds:
          this.selectedDomainOptionIds().length > 0 ? this.selectedDomainOptionIds() : undefined,
      })
      .subscribe({
        next: (response) => {
          this.employees.set(response.content);
          this.totalRecords.set(response.page.totalElements);
          this.loading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          if (err.status === 404) {
            this.employees.set([]);
            this.totalRecords.set(0);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to load employees.',
            });
            console.error(err);
          }
        },
      });
  }

  onFilter(): void {
    this.table.reset();
  }

  toggleDomainOption(optionId: number): void {
    this.selectedDomainOptionIds.update((current) => {
      if (current.includes(optionId)) {
        return current.filter((id) => id !== optionId);
      } else {
        return [...current, optionId];
      }
    });
    this.onFilter();
  }

  clearFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.searchQuery.set('');
    this.selectedRole.set(null);
    this.selectedDomainOptionIds.set([]);
    this.onFilter();
  }

  navigateToCv(userId: number): void {
    this.router.navigate(['/cv', userId]);
  }
}
