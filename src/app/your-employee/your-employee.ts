import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TitleCasePipe } from '@angular/common';
import { YourEmployeeService } from './service/your-employee-service';
import { CurriculumAndUserLightDto } from './model/curriculum-and-user-light-dto';

@Component({
  selector: 'app-your-employee',
  templateUrl: './your-employee.html',
  styleUrl: './your-employee.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableModule, ButtonModule, TagModule, CardModule, ToastModule, TitleCasePipe],
  providers: [MessageService],
})
export class YourEmployee {
  private readonly yourEmployeeService = inject(YourEmployeeService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly employees = signal<CurriculumAndUserLightDto[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly loading = signal<boolean>(true);

  // Default pagination state
  private currentPage = 1;
  private pageSize = 10;

  loadData(event: TableLazyLoadEvent) {
    this.loading.set(true);

    const first = event.first ?? 0;
    const rows = event.rows ?? 10;
    this.currentPage = Math.floor(first / rows) + 1;
    this.pageSize = rows;

    this.yourEmployeeService.getEmployees(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.employees.set(response.content);
        this.totalRecords.set(response.page.totalElements);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load employees.',
        });
        console.error(err);
      },
    });
  }

  navigateToCv(userId: number): void {
    this.router.navigate(['/cv', userId]);
  }
}
