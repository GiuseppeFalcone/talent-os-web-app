import { Component, inject, OnInit, signal, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { PasswordModule } from 'primeng/password';
import { ManageUserService } from './service/manage-user-service';
import { UserRoleEnum } from '../enumeration/user-role-enum';
import { UserLightDto } from '../dashboard/model/user-light-dto';
import { CreateUserDto } from './model/create-user-dto';
import { UserDto } from '../dashboard/model/user-dto';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-manage-user',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    SelectModule,
    ToastModule,
    ConfirmDialogModule,
    ReactiveFormsModule,
    FormsModule,
    TagModule,
    TitleCasePipe,
    PasswordModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
  ],
  templateUrl: './manage-user.html',
  styleUrl: './manage-user.css',
  providers: [MessageService, ConfirmationService],
})
export class ManageUser implements OnInit, OnDestroy {
  private readonly userService = inject(ManageUserService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly fb = inject(FormBuilder);

  @ViewChild('dt') table!: Table;

  users = signal<UserLightDto[]>([]);
  totalRecords = signal(0);
  loading = signal(true);

  // Dialog controls
  userDialog = signal(false);
  passwordDialog = signal(false);
  isEditMode = signal(false);
  submitted = signal(false);
  currentUser = signal<UserDto | null>(null);

  // Filters
  searchQuery = signal('');
  searchControl = new FormControl('');
  selectedRoleFilter = signal<UserRoleEnum | null>(null);

  private searchSub?: Subscription;

  // Forms
  userForm: FormGroup;
  passwordForm: FormGroup;

  // Manager Selection
  managers = signal<{ label: string; value: number }[]>([]);

  roles = [
    { label: 'Employee', value: UserRoleEnum.EMPLOYEE },
    { label: 'Manager', value: UserRoleEnum.MANAGER },
    { label: 'Admin', value: UserRoleEnum.ADMIN },
    { label: 'Super Admin', value: UserRoleEnum.SUPERADMIN },
  ];

  roleOptions = [...this.roles];

  constructor() {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('[A-Za-z0-9._%+-]+@company.com$'),
        ],
      ],
      role: [UserRoleEnum.EMPLOYEE, Validators.required],
      managerId: [null],
    });

    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit() {
    this.searchSub = this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.searchQuery.set(value || '');
        this.onFilter();
      });
  }

  ngOnDestroy() {
    this.searchSub?.unsubscribe();
  }

  loadManagers() {
    this.userService
      .getUsers({ page: 1, pageSize: 1000, queryRole: UserRoleEnum.MANAGER })
      .subscribe({
        next: (data) => {
          this.managers.set(
            data.content.map((u) => ({
              label: `${u.firstName} ${u.lastName} (${u.username})`,
              value: u.userId,
            }))
          );
        },
      });
  }

  loadUsers(event: TableLazyLoadEvent) {
    this.loading.set(true);
    const page = (event.first ?? 0) / (event.rows ?? 10) + 1;
    const pageSize = event.rows ?? 10;

    this.userService
      .getUsers({
        page,
        pageSize,
        searchString: this.searchQuery() || undefined,
        queryRole: this.selectedRoleFilter() || undefined,
      })
      .subscribe({
        next: (data) => {
          this.users.set(data.content);
          this.totalRecords.set(data.page.totalElements);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load users',
          });
        },
      });
  }

  onFilter() {
    this.table.reset();
  }

  openNew() {
    if (this.managers().length === 0) {
      this.loadManagers();
    }
    this.userForm.reset({ role: UserRoleEnum.EMPLOYEE });
    this.isEditMode.set(false);
    this.submitted.set(false);
    this.userDialog.set(true);
  }

  editUser(userLight: UserLightDto) {
    if (this.managers().length === 0) {
      this.loadManagers();
    }
    this.userService.getUserById(userLight.userId).subscribe({
      next: (user) => {
        this.currentUser.set(user);
        this.userForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          managerId: user.managerId,
        });
        this.isEditMode.set(true);
        this.userDialog.set(true);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load user details',
        });
      },
    });
  }

  deleteUser(user: UserLightDto) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${user.firstName} ${user.lastName}?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.deleteUser(user.userId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'User Deleted',
              life: 3000,
            });
            this.onFilter(); // Reload table
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete user',
            });
          },
        });
      },
    });
  }

  openPasswordReset(user: UserLightDto) {
    this.passwordForm.reset();
    this.currentUser.set({ ...user } as any);
    this.passwordDialog.set(true);
  }

  saveUser() {
    this.submitted.set(true);

    if (this.userForm.invalid) {
      return;
    }

    const formValue = this.userForm.value;

    if (this.isEditMode()) {
      const user = this.currentUser()!;
      const updatedUser: UserDto = {
        ...user,
        ...formValue,
      };

      this.userService.updateUser(user.userId, updatedUser).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'User Updated',
            life: 3000,
          });
          this.userDialog.set(false);
          this.onFilter();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update user',
          });
        },
      });
    } else {
      const newUser: CreateUserDto = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        role: formValue.role,
        managerId: formValue.managerId,
      };

      this.userService.createUser(newUser).subscribe({
        next: (credential) => {
          this.messageService.add({
            severity: 'success',
            summary: 'User Created',
            detail: `Username: ${credential.username}, Password: ${credential.password}`,
            sticky: true,
          });
          this.userDialog.set(false);
          this.onFilter();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create user',
          });
        },
      });
    }
  }

  savePassword() {
    if (this.passwordForm.invalid || !this.currentUser()) return;

    const username = this.currentUser()!.username;
    const newPassword = this.passwordForm.get('newPassword')?.value;

    this.userService.resetPassword({ username, password: newPassword }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Password Reset Successfully',
          life: 3000,
        });
        this.passwordDialog.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to reset password',
        });
      },
    });
  }

  hideDialog() {
    this.userDialog.set(false);
    this.submitted.set(false);
  }
}
