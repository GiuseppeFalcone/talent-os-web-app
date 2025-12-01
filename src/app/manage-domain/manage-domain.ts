import { Component, inject, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
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
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { HasRoleDirective } from '../rbac/directive/has-role-directive';

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
    HasRoleDirective,
  ],
  templateUrl: './manage-domain.html',
  styleUrl: './manage-domain.css',
})
export class ManageDomain implements OnInit, OnDestroy {
  private readonly domainService = inject(ManageDomainService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly fb = inject(FormBuilder);

  // State
  domains = signal<DomainDto[]>([]);
  selectedDomain = signal<DomainDto | null>(null);

  // Search Signals
  domainSearchQuery = signal<string>('');

  // UI State
  loadingDomains = signal<boolean>(false);
  loadingOptions = signal<boolean>(false);

  // Dialog State
  domainDialogVisible = signal<boolean>(false);
  optionDialogVisible = signal<boolean>(false);

  isEditMode = signal<boolean>(false);
  submitted = signal<boolean>(false);

  // Forms
  domainForm: FormGroup;
  optionForm: FormGroup;

  // Search Controls
  searchControl = new FormControl('');
  optionSearchControl = new FormControl('');

  private searchSub?: Subscription;
  private optionSearchSub?: Subscription;

  editingOptionId = signal<number | null>(null);

  filteredOptions = computed(() => {
    const domain = this.selectedDomain();
    if (!domain || !domain.domainOptions) return [];
    return domain.domainOptions;
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
    this.setupSearchSubscriptions();
    this.loadDomains();
  }

  ngOnDestroy() {
    this.searchSub?.unsubscribe();
    this.optionSearchSub?.unsubscribe();
  }

  private setupSearchSubscriptions() {
    // Domain Search
    this.searchSub = this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.domainSearchQuery.set(value || '');
        this.loadDomains();
      });

    // Option Search
    this.optionSearchSub = this.optionSearchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.onOptionSearch(value || '');
      });
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
              if (!this.optionSearchControl.value) {
                this.selectedDomain.set(found);
              }
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

  onOptionSearch(query: string) {
    const currentDomain = this.selectedDomain();
    if (!currentDomain) return;

    this.loadingOptions.set(true);

    if (!query) {
      this.domainService.getDomainById(currentDomain.domainId).subscribe({
        next: (domain) => {
          this.selectedDomain.set(domain);
          this.loadingOptions.set(false);
        },
        error: () => {
          this.loadingOptions.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to reload options',
          });
        },
      });
      return;
    }

    this.domainService
      .getDomains({
        page: 1,
        pageSize: 1,
        domainName: currentDomain.domainName,
        domainOptionValue: query,
      })
      .subscribe({
        next: (response) => {
          if (response.content.length > 0) {
            this.selectedDomain.set(response.content[0]);
          } else {
            this.selectedDomain.update((d) => (d ? { ...d, domainOptions: [] } : null));
          }
          this.loadingOptions.set(false);
        },
        error: () => {
          this.loadingOptions.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to search options',
          });
        },
      });
  }

  onDomainSearch() {
    this.loadDomains();
  }

  onSelectDomain(domain: DomainDto) {
    this.selectedDomain.set(domain);
    this.optionSearchControl.setValue('', { emitEvent: false });
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

    const name = this.domainForm.value.domainName.trim().toLowerCase().replace(/ /g, '_');

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
        if (this.optionSearchControl.value) {
          this.onOptionSearch(this.optionSearchControl.value);
        } else {
          this.selectedDomain.set(res);
        }
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

            if (this.optionSearchControl.value) {
              this.onOptionSearch(this.optionSearchControl.value);
            } else {
              this.selectedDomain.set(res);
            }
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
