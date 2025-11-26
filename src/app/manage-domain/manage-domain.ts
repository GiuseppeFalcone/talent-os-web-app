import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ListboxModule } from 'primeng/listbox';
import { CardModule } from 'primeng/card';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { ManageDomainService } from './service/manage-domain-service';
import { DomainDto } from './model/domain-dto';
import { DomainOptionDto } from './model/domain-option-dto';
import { CreateDomainDto } from './model/create-domain-dto';

@Component({
  selector: 'app-manage-domain',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    ListboxModule,
    CardModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    TitleCasePipe,
  ],
  templateUrl: './manage-domain.html',
  styleUrl: './manage-domain.css',
  providers: [MessageService, ConfirmationService],
})
export class ManageDomain implements OnInit {
  private readonly domainService = inject(ManageDomainService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly fb = inject(FormBuilder);

  // State
  domains = signal<DomainDto[]>([]);
  selectedDomain = signal<DomainDto | null>(null);

  // Search Signals
  domainSearchQuery = signal<string>('');
  localOptionFilterQuery = signal<string>('');

  // UI State
  loadingDomains = signal<boolean>(false);

  // Dialog State
  domainDialogVisible = signal<boolean>(false);
  optionDialogVisible = signal<boolean>(false);

  isEditMode = signal<boolean>(false);
  submitted = signal<boolean>(false);

  // Forms
  domainForm: FormGroup;
  optionForm: FormGroup;

  // Track currently editing option
  editingOptionId = signal<number | null>(null);

  // Filter visible options in the right column based on local search
  filteredOptions = computed(() => {
    const domain = this.selectedDomain();
    const query = this.localOptionFilterQuery().toLowerCase();

    if (!domain || !domain.domainOptions) return [];

    if (!query) return domain.domainOptions;

    return domain.domainOptions.filter((opt) => opt.value.toLowerCase().includes(query));
  });

  constructor() {
    this.domainForm = this.fb.group({
      domainName: ['', Validators.required],
    });

    this.optionForm = this.fb.group({
      value: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.loadDomains();
  }

  loadDomains() {
    this.loadingDomains.set(true);

    this.domainService
      .getDomains({
        page: 1,
        pageSize: 100,
        domainName: this.domainSearchQuery() || undefined,
      })
      .subscribe({
        next: (response) => {
          this.domains.set(response.content);
          this.loadingDomains.set(false);

          const current = this.selectedDomain();
          if (current) {
            const found = response.content.find((d) => d.domainId === current.domainId);
            if (found) {
              this.selectedDomain.set(found);
            } else {
              this.selectedDomain.set(null);
            }
          }
        },
        error: () => {
          this.loadingDomains.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load domains',
          });
        },
      });
  }

  onDomainSearch() {
    this.loadDomains();
  }

  onSelectDomain(domain: DomainDto) {
    this.selectedDomain.set(domain);
    this.localOptionFilterQuery.set('');
  }

  openNewDomainDialog() {
    this.isEditMode.set(false);
    this.domainForm.reset();
    this.submitted.set(false);
    this.domainDialogVisible.set(true);
  }

  openEditDomainDialog(domain: DomainDto, event: Event) {
    event.stopPropagation();
    this.isEditMode.set(true);
    this.domainForm.patchValue({ domainName: domain.domainName });
    this.selectedDomain.set(domain);
    this.submitted.set(false);
    this.domainDialogVisible.set(true);
  }

  saveDomain() {
    this.submitted.set(true);
    if (this.domainForm.invalid) return;

    const name = this.domainForm.value.domainName;

    if (this.isEditMode()) {
      const current = this.selectedDomain()!;
      const updatedDto: DomainDto = {
        ...current,
        domainName: name,
      };

      this.domainService.updateDomain(current.domainId, updatedDto).subscribe({
        next: (res) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Domain updated',
          });
          this.domainDialogVisible.set(false);
          this.loadDomains();
        },
        error: () =>
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update domain',
          }),
      });
    } else {
      const newDomain: CreateDomainDto = {
        domainName: name,
        domainOptions: [],
      };
      this.domainService.createDomain(newDomain).subscribe({
        next: (res) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Domain created',
          });
          this.domainDialogVisible.set(false);
          this.loadDomains();
        },
        error: () =>
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create domain',
          }),
      });
    }
  }

  deleteDomain(domain: DomainDto, event: Event) {
    event.stopPropagation();
    this.confirmationService.confirm({
      message: `Are you sure you want to delete '${domain.domainName}'?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.domainService.deleteDomain(domain.domainId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Domain deleted',
            });
            if (this.selectedDomain()?.domainId === domain.domainId) {
              this.selectedDomain.set(null);
            }
            this.loadDomains();
          },
          error: () =>
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete domain',
            }),
        });
      },
    });
  }

  // --- Option Logic ---

  openNewOptionDialog() {
    if (!this.selectedDomain()) return;
    this.isEditMode.set(false);
    this.optionForm.reset();
    this.submitted.set(false);
    this.optionDialogVisible.set(true);
  }

  openEditOptionDialog(option: DomainOptionDto) {
    this.isEditMode.set(true);
    this.editingOptionId.set(option.domainOptionId);
    this.optionForm.patchValue({ value: option.value });
    this.submitted.set(false);
    this.optionDialogVisible.set(true);
  }

  saveOption() {
    this.submitted.set(true);
    if (this.optionForm.invalid) return;

    const domain = this.selectedDomain();
    if (!domain) return;

    const newValue = this.optionForm.value.value;
    const currentOptions = [...domain.domainOptions];

    if (this.isEditMode()) {
      const id = this.editingOptionId();
      const index = currentOptions.findIndex((o) => o.domainOptionId === id);
      if (index !== -1) {
        currentOptions[index] = { ...currentOptions[index], value: newValue };
      }
    } else {
      currentOptions.push({ domainOptionId: 0, value: newValue });
    }

    const updatedDomain: DomainDto = {
      ...domain,
      domainOptions: currentOptions,
    };

    this.domainService.updateDomain(domain.domainId, updatedDomain).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Options updated',
        });
        this.optionDialogVisible.set(false);
        this.selectedDomain.set(res);
        this.domains.update((ds) => ds.map((d) => (d.domainId === res.domainId ? res : d)));
      },
      error: () =>
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save option',
        }),
    });
  }

  deleteOption(option: DomainOptionDto) {
    this.confirmationService.confirm({
      message: `Delete option '${option.value}'?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const domain = this.selectedDomain();
        if (!domain) return;

        const updatedOptions = domain.domainOptions.filter(
          (o) => o.domainOptionId !== option.domainOptionId
        );

        const updatedDomain: DomainDto = {
          ...domain,
          domainOptions: updatedOptions,
        };

        this.domainService.updateDomain(domain.domainId, updatedDomain).subscribe({
          next: (res) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Option removed',
            });
            this.selectedDomain.set(res);
            this.domains.update((ds) => ds.map((d) => (d.domainId === res.domainId ? res : d)));
          },
          error: () =>
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete option',
            }),
        });
      },
    });
  }
}
