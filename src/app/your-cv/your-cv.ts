import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { ActivatedRoute } from '@angular/router';
import { YourCvService } from './service/your-cv-service';
import { AuthService } from '../auth/service/auth-service';
import { ManageUserService } from '../manage-user/service/manage-user-service';
import { CurriculumDetailDto } from './model/curriculum-detail-dto';
import { ProjectDomainOptionDto } from './model/project-domain-option-dto';
import { DomainDto } from '../manage-domain/model/domain-dto';
import { DrivingLicenseEnum, DRIVING_LICENSE_OPTIONS } from './enum/driving-license-enum';
import { ProjectDto } from './model/project-dto';
import { DomainOptionDto } from '../manage-domain/model/domain-option-dto';
import { EducationDto } from './model/education-dto';
import { UserDomainOptionDto } from '../dashboard/model/user-domain-option-dto';
import { UserDto } from '../dashboard/model/user-dto';
import { HasRoleDirective } from '../rbac/directive/has-role-directive';

interface EducationFormControls {
  educationId: FormControl<number | undefined>;
  degreeNameId: FormControl<number | null>;
  schoolNameId: FormControl<number | null>;
  startDate: FormControl<Date | null>;
  endDate: FormControl<Date | null>;
  grade: FormControl<number | null>;
  maxGrade: FormControl<number | null>;
}

type ProjectFormControls = Record<string, FormControl>;
type UserSkillsFormControls = Record<string, FormControl>;

@Component({
  selector: 'app-your-cv',
  templateUrl: './your-cv.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CardModule,
    TagModule,
    ChipModule,
    DividerModule,
    ToastModule,
    ButtonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    ToggleSwitchModule,
    SelectModule,
    DatePickerModule,
    DatePipe,
    MultiSelectModule,
    TitleCasePipe,
    ConfirmDialogModule,
    HasRoleDirective,
  ],
})
export class YourCv implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly yourCvService = inject(YourCvService);
  private readonly manageUserService = inject(ManageUserService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly route = inject(ActivatedRoute);

  private readonly MAX_SKILL_GRADE = 5 as const;

  // State Signals
  readonly loading = signal<boolean>(true);
  readonly notFound = signal<boolean>(false);
  readonly isCreating = signal<boolean>(false);
  readonly curriculumDetail = signal<CurriculumDetailDto | null>(null);

  // Track if the profile being viewed belongs to the logged-in user
  private readonly isCurrentUserProfile = signal<boolean>(false);

  // Derived Signals
  readonly user = computed(() => this.curriculumDetail()?.user);
  readonly curriculum = computed(() => this.curriculumDetail()?.curriculum ?? null);

  // Determines if we have edit rights.
  readonly isOwner = computed(() => {
    return this.isCreating() || this.isCurrentUserProfile();
  });

  readonly domains = computed(() => this.curriculumDetail()?.domains ?? []);
  readonly schools = computed(() => this.curriculumDetail()?.schools ?? []);
  readonly degrees = computed(() => this.curriculumDetail()?.degrees ?? []);
  readonly educationHistory = computed(() => this.curriculum()?.educationHistory ?? []);
  readonly projects = computed(() => this.curriculum()?.projects ?? []);
  readonly curriculumSkillItems = computed(
    () => (this.curriculum()?.domainOptions ?? []) as ProjectDomainOptionDto[]
  );

  readonly skillsByDomain = computed(() => {
    const idx = this.domainOptionIndex();
    const domainMap = new Map<string, Map<number, { label: string; grade: number }>>();

    const addSkill = (domainName: string, optionId: number, grade: number) => {
      const label = idx.get(optionId);
      if (!label) return;

      if (!domainMap.has(domainName)) {
        domainMap.set(domainName, new Map());
      }

      const skillsMap = domainMap.get(domainName)!;
      const existing = skillsMap.get(optionId);
      if (!existing || grade > existing.grade) {
        skillsMap.set(optionId, { label, grade });
      }
    };

    for (const raw of this.curriculumSkillItems()) {
      const domain = this.findDomainByOptionId(raw.domainOptionId);
      if (domain) {
        addSkill(domain.domainName, raw.domainOptionId, raw.grade ?? 0);
      }
    }

    for (const project of this.projects()) {
      if (!project.domainOptions) continue;

      for (const skill of project.domainOptions) {
        const domain = this.findDomainByOptionId(skill.domainOptionId);
        if (domain) {
          addSkill(domain.domainName, skill.domainOptionId, skill.grade ?? 0);
        }
      }
    }

    for (const udo of this.user()?.userDomainOptions ?? []) {
      const domain = this.findDomainByOptionId(udo.domainOptionId);
      if (domain) {
        addSkill(domain.domainName, udo.domainOptionId, udo.grade ?? 0);
      }
    }

    return Array.from(domainMap.entries())
      .map(([domainName, skillsMap]) => ({
        domainName,
        skills: Array.from(skillsMap.values()).sort(
          (a, b) => b.grade - a.grade || a.label.localeCompare(b.label)
        ),
      }))
      .filter(
        (domain) =>
          domain.domainName.toLowerCase() !== 'school' &&
          domain.domainName.toLowerCase() !== 'degree'
      )
      .sort((a, b) => a.domainName.localeCompare(b.domainName));
  });

  readonly editingUserSkills = signal<boolean>(false);

  readonly domainOptionIndex = computed(() => {
    const map = new Map<number, string>();
    for (const d of this.possibleDomains()) {
      for (const o of d.domainOptions) {
        map.set(o.domainOptionId, o.value);
      }
    }
    return map;
  });

  readonly schoolsIndex = computed(() => {
    const map = new Map<number, string>();

    for (const s of this.schools()) {
      map.set(s.domainOptionId, s.value);
    }

    const schoolDomain = this.possibleDomains().find(
      (d) => d.domainName.toLowerCase() === 'school'
    );
    if (schoolDomain) {
      for (const option of schoolDomain.domainOptions) {
        map.set(option.domainOptionId, option.value);
      }
    }

    return map;
  });

  readonly degreesIndex = computed(() => {
    const map = new Map<number, string>();

    for (const d of this.degrees()) {
      map.set(d.domainOptionId, d.value);
    }

    const degreeDomain = this.possibleDomains().find(
      (d) => d.domainName.toLowerCase() === 'degree'
    );
    if (degreeDomain) {
      for (const option of degreeDomain.domainOptions) {
        map.set(option.domainOptionId, option.value);
      }
    }

    return map;
  });

  readonly schoolOptions = computed(() => {
    const domain = this.possibleDomains().find((d) => d.domainName.toLowerCase() === 'school');
    return domain?.domainOptions ?? [];
  });

  readonly degreeOptions = computed(() => {
    const domain = this.possibleDomains().find((d) => d.domainName.toLowerCase() === 'degree');
    return domain?.domainOptions ?? [];
  });

  readonly allSkills = computed(() => {
    const idx = this.domainOptionIndex();
    const best = new Map<number, { label: string; grade: number }>();

    for (const raw of this.curriculumSkillItems()) {
      const id = raw.domainOptionId;
      const grade = raw.grade ?? 0;
      const label = idx.get(id);
      if (!label) {
        continue;
      }
      const prev = best.get(id)?.grade ?? 0;
      if (grade > prev) {
        best.set(id, { label, grade });
      }
    }

    for (const project of this.projects()) {
      if (!project.domainOptions) {
        continue;
      }

      for (const skill of project.domainOptions) {
        const id = skill.domainOptionId;
        const grade = skill.grade ?? 0;
        const label = idx.get(id);
        if (!label) {
          continue;
        }
        const prev = best.get(id)?.grade ?? 0;
        if (grade > prev) {
          best.set(id, { label, grade });
        }
      }
    }

    for (const udo of this.user()?.userDomainOptions ?? []) {
      const id = udo.domainOptionId;
      const grade = udo.grade ?? 0;
      const label = idx.get(id);
      if (!label) {
        continue;
      }
      const prev = best.get(id)?.grade ?? 0;
      if (grade > prev) {
        best.set(id, { label, grade });
      }
    }

    return Array.from(best.values()).sort((a, b) => a.label.localeCompare(b.label));
  });

  readonly drivingLicenseLabel = computed(() => {
    const dl = this.curriculum()?.drivingLicense;
    if (dl === null || dl === undefined || dl === 0) {
      return 'None';
    }
    return String(dl);
  });

  readonly isEditMode = signal<boolean>(false);
  private readonly allDomainsLoaded = signal<boolean>(false);
  readonly editingEducationIndex = signal<number | null>(null);
  readonly editingProjectIndex = signal<number | null>(null);

  readonly cvForm = new FormGroup({
    summary: new FormControl<string>(''),
    mobilePhone: new FormControl<string>(''),
    homeAddress: new FormControl<string>(''),
    workAddress: new FormControl<string>(''),
    maritalStatus: new FormControl<boolean>(false, { nonNullable: true }),
    drivingLicense: new FormControl<DrivingLicenseEnum | null>(null),
    hasCar: new FormControl<boolean>(false, { nonNullable: true }),
    openForTravel: new FormControl<boolean>(false, { nonNullable: true }),
    educationHistory: new FormArray<FormGroup<EducationFormControls>>([]),
    projects: new FormArray<FormGroup<ProjectFormControls>>([]),
    userSkills: new FormGroup<UserSkillsFormControls>({}),
  });

  readonly possibleDomains = signal<DomainDto[]>([]);
  readonly allProjectSkills = computed(() => {
    return this.possibleDomains().filter(
      (d) => d.domainName.toLowerCase() !== 'school' && d.domainName.toLowerCase() !== 'degree'
    );
  });
  readonly possibleDrivingLicenses = DRIVING_LICENSE_OPTIONS;

  get educationHistoryArray(): FormArray<FormGroup<EducationFormControls>> {
    return this.cvForm.get('educationHistory') as FormArray<FormGroup<EducationFormControls>>;
  }

  get projectsArray(): FormArray<FormGroup<ProjectFormControls>> {
    return this.cvForm.get('projects') as FormArray<FormGroup<ProjectFormControls>>;
  }

  get userSkillsForm(): FormGroup<UserSkillsFormControls> {
    return this.cvForm.get('userSkills') as FormGroup<UserSkillsFormControls>;
  }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    this.notFound.set(false);
    this.isCreating.set(false);
    this.curriculumDetail.set(null);

    const userIdParam = this.route.snapshot.paramMap.get('userId');
    const currentUserId = this.authService.currentUser()?.userId;

    // Determine if we are viewing our own profile
    const isSelf = !userIdParam || (!!currentUserId && Number(userIdParam) === currentUserId);
    this.isCurrentUserProfile.set(isSelf);

    const targetUserId = userIdParam ? Number(userIdParam) : currentUserId;

    const fetchCv$ = userIdParam
      ? this.yourCvService.getCurriculumDetailsByUserId(Number(userIdParam))
      : this.yourCvService.getCurriculumDetailsForCurrentUser();

    fetchCv$.subscribe({
      next: (curriculum) => {
        this.loading.set(false);
        if (!curriculum) {
          this.notFound.set(true);
          return;
        }

        this.curriculumDetail.set(curriculum);
        this.possibleDomains.set(curriculum.domains ?? []);
        this.patchFormFromCurriculum();
      },
      error: (err: HttpErrorResponse | any) => {
        this.loading.set(false);

        if (err.status === 404 || (err.message && err.message.includes('No curriculum found'))) {
          if (targetUserId) {
            this.manageUserService.getUserById(targetUserId).subscribe({
              next: (userDto) => {
                this.curriculumDetail.set({
                  user: userDto,
                  curriculum: { curriculumId: 0, userId: userDto.userId },
                  domains: [],
                  schools: [],
                  degrees: [],
                });
                this.notFound.set(true);
              },
              error: () => this.notFound.set(true),
            });
          } else {
            this.notFound.set(true);
          }
          return;
        }

        let detail: string = 'Failed to load data.';
        if (err instanceof HttpErrorResponse && err.status === 403) {
          detail = 'Access denied.';
        } else if (err.message) {
          detail = err.message;
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Error Loading Curriculum',
          detail: detail,
          life: 5000,
        });
      },
    });
  }

  initCreation(): void {
    const existingUser = this.user();
    const currentUser = existingUser || this.authService.currentUser();

    if (!currentUser) return;

    this.yourCvService.getAllDomains().subscribe({
      next: (domains) => {
        this.possibleDomains.set(domains);
        this.allDomainsLoaded.set(true);

        const newDetail: CurriculumDetailDto = {
          user:
            'userDomainOptions' in currentUser
              ? (currentUser as UserDto)
              : {
                  userId: currentUser.userId,
                  username: currentUser.username,
                  firstName: currentUser.firstName,
                  lastName: currentUser.lastName,
                  role: currentUser.role,
                  email: '',
                  employeeIds: [],
                  userDomainOptions: [],
                  managerId: 0,
                },
          curriculum: {
            curriculumId: 0,
            userId: currentUser.userId,
            educationHistory: [],
            projects: [],
            domainOptions: [],
          },
          domains: [],
          schools: [],
          degrees: [],
        };

        this.curriculumDetail.set(newDetail);
        this.patchFormFromCurriculum();

        this.isCreating.set(true);
        this.isEditMode.set(true);
        this.notFound.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not initialize form.',
        });
      },
    });
  }

  toggleEditMode(): void {
    if (this.isCreating() && this.isEditMode()) {
      // Cancel creation -> go back to "Not Found"
      this.isCreating.set(false);
      this.isEditMode.set(false);
      this.notFound.set(true);
      return;
    }

    const willBeEditMode = !this.isEditMode();
    if (willBeEditMode && !this.allDomainsLoaded()) {
      this.yourCvService.getAllDomains().subscribe({
        next: (domains) => {
          this.possibleDomains.set(domains);
          this.allDomainsLoaded.set(true);
          this.patchFormFromCurriculum();
          this.isEditMode.set(true);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load domain options. Please try again.',
            life: 3000,
          });
        },
      });
    } else {
      this.isEditMode.update((current) => {
        const next = !current;
        if (!next) {
          this.editingEducationIndex.set(null);
          this.editingProjectIndex.set(null);
          this.patchFormFromCurriculum();
        }
        return next;
      });
    }
  }

  saveCurriculum(): void {
    if (!this.cvForm.valid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fix all validation errors before saving.',
        life: 3000,
      });
      return;
    }

    const formValue = this.cvForm.value;
    const current = this.curriculumDetail()!;

    const curriculumDto: any = {
      curriculumId: current.curriculum.curriculumId,
      userId: current.curriculum.userId,
      summary: formValue.summary ?? '',
      mobilePhone: formValue.mobilePhone ?? '',
      homeAddress: formValue.homeAddress ?? '',
      workAddress: formValue.workAddress ?? '',
      maritalStatus: formValue.maritalStatus ?? false,
      drivingLicense: formValue.drivingLicense ?? undefined,
      hasCar: formValue.hasCar ?? false,
      openForTravel: formValue.openForTravel ?? false,
      educationHistory: current.curriculum.educationHistory as any,
      projects: current.curriculum.projects as any,
      domainOptions: current.curriculum.domainOptions as any,
    };

    const userDto: UserDto = {
      ...current.user!,
      userDomainOptions: current.user!.userDomainOptions ?? [],
    };

    if (this.isCreating()) {
      this.yourCvService
        .createCurriculum({ createCurriculumDto: curriculumDto, userDto })
        .subscribe({
          next: () => {
            this.isCreating.set(false);
            this.loadData();
            this.messageService.add({
              severity: 'success',
              summary: 'Created',
              detail: 'Curriculum created successfully.',
              life: 3000,
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to create curriculum.',
            });
          },
        });
    } else {
      this.yourCvService.updateCurriculum(curriculumDto, userDto).subscribe({
        next: (updatedCurriculum) => {
          this.curriculumDetail.set(updatedCurriculum);
          this.isEditMode.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Curriculum updated successfully.',
            life: 3000,
          });
        },
        error: (error: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message ?? 'Failed to update curriculum.',
            life: 3000,
          });
        },
      });
    }
  }

  deleteCurriculum(): void {
    const id = this.curriculum()?.curriculumId;
    if (!id) return;

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete your curriculum? This action cannot be undone.',
      header: 'Delete Curriculum',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.yourCvService.deleteCurriculum(id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Deleted',
              detail: 'Curriculum deleted.',
            });
            this.curriculumDetail.set(null);
            this.isEditMode.set(false);
            this.isCreating.set(false);
            this.notFound.set(true);
            this.loadData();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete curriculum.',
            });
          },
        });
      },
    });
  }

  private patchFormFromCurriculum(): void {
    const c = this.curriculum();
    this.cvForm.patchValue({
      summary: c?.summary ?? '',
      mobilePhone: c?.mobilePhone ?? '',
      homeAddress: c?.homeAddress ?? '',
      workAddress: c?.workAddress ?? '',
      maritalStatus: !!c?.maritalStatus,
      drivingLicense: c?.drivingLicense ?? null,
      hasCar: !!c?.hasCar,
      openForTravel: !!c?.openForTravel,
    });

    this.educationHistoryArray.clear();
    const educations = this.educationHistory();
    for (const edu of educations) {
      this.educationHistoryArray.push(this.createEducationFormGroup(edu));
    }

    this.projectsArray.clear();
    const projectList = this.projects();
    for (const proj of projectList) {
      this.projectsArray.push(this.createProjectFormGroup(proj));
    }

    this.patchUserSkillsForm();
  }

  private createProjectFormGroup(project?: ProjectDto): FormGroup<ProjectFormControls> {
    const domainOptionsMap = new Map<number, number[]>();
    const skillGradesMap = new Map<number, number>();

    if (project?.domainOptions) {
      for (const option of project.domainOptions) {
        const domain = this.findDomainByOptionId(option.domainOptionId);
        if (domain) {
          if (!domainOptionsMap.has(domain.domainId)) {
            domainOptionsMap.set(domain.domainId, []);
          }
          domainOptionsMap.get(domain.domainId)!.push(option.domainOptionId);
          skillGradesMap.set(option.domainOptionId, option.grade ?? 0);
        }
      }
    }

    const controls: ProjectFormControls = {
      projectId: new FormControl<number | undefined>(project?.projectId, { nonNullable: false }),
      projectDescription: new FormControl<string>(project?.description ?? '', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      startDate: new FormControl<Date | null>(
        project?.startDate ? new Date(project.startDate) : null,
        { validators: [Validators.required] }
      ),
      endDate: new FormControl<Date | null>(project?.endDate ? new Date(project.endDate) : null),
    };

    for (const domain of this.allProjectSkills()) {
      const controlName = this.getDomainFormControlName(domain.domainId);
      controls[controlName] = new FormControl<number[]>(
        domainOptionsMap.get(domain.domainId) ?? [],
        { nonNullable: true }
      );

      for (const option of domain.domainOptions) {
        const gradeControlName = this.getSkillGradeControlName(option.domainOptionId);
        controls[gradeControlName] = new FormControl<number>(
          skillGradesMap.get(option.domainOptionId) ?? 1,
          {
            validators: [Validators.min(1), Validators.max(this.MAX_SKILL_GRADE)],
            nonNullable: true,
          }
        );
      }
    }

    return new FormGroup(controls);
  }

  private findDomainByOptionId(optionId: number): DomainDto | undefined {
    return this.possibleDomains().find((domain) =>
      domain.domainOptions.some((opt) => opt.domainOptionId === optionId)
    );
  }

  getDomainFormControlName(domainId: number): string {
    return `domain_${domainId}`;
  }

  getSkillGradeControlName(domainOptionId: number): string {
    return `grade_${domainOptionId}`;
  }

  getSelectedSkillsForDomain(projectFormGroup: FormGroup, domainId: number): number[] {
    const controlName = this.getDomainFormControlName(domainId);
    return (projectFormGroup.get(controlName)?.value as number[]) ?? [];
  }

  getDomainOption(domainOptions: DomainOptionDto[], optionId: number): DomainOptionDto | undefined {
    return domainOptions.find((opt) => opt.domainOptionId === optionId);
  }

  saveProject(index: number): void {
    const formGroup = this.projectsArray.at(index);
    if (!formGroup.valid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields.',
        life: 3000,
      });
      return;
    }

    const formValue = formGroup.value;
    const domainOptions: ProjectDomainOptionDto[] = [];

    for (const domain of this.allProjectSkills()) {
      const controlName = this.getDomainFormControlName(domain.domainId);
      const selectedSkills = formValue[controlName] as number[] | undefined;

      if (selectedSkills) {
        for (const optionId of selectedSkills) {
          const gradeControlName = this.getSkillGradeControlName(optionId);
          const grade = formValue[gradeControlName] as number | undefined;

          domainOptions.push({
            domainId: domain.domainId,
            domainOptionId: optionId,
            userId: this.user()?.userId ?? 0,
            grade: grade ?? 1,
          });
        }
      }
    }

    const updatedProject: ProjectDto = {
      projectId: formValue['projectId'] as number | undefined,
      description: (formValue['projectDescription'] as string | undefined) ?? '',
      startDate: formValue['startDate'] ? this.formatDate(formValue['startDate'] as Date) : '',
      endDate: formValue['endDate'] ? this.formatDate(formValue['endDate'] as Date) : undefined,
      domainOptions,
    };

    this.curriculumDetail.update((detail) => {
      if (!detail?.curriculum) return detail;

      const updatedProjects = [...(detail.curriculum.projects ?? [])];
      updatedProjects[index] = updatedProject;

      return {
        ...detail,
        curriculum: {
          ...detail.curriculum,
          projects: updatedProjects,
        },
      };
    });

    this.editingProjectIndex.set(null);
    this.messageService.add({
      severity: 'success',
      summary: 'Project Saved',
      detail: 'Project entry has been saved successfully.',
      life: 3000,
    });
  }

  addProject(): void {
    this.projectsArray.push(this.createProjectFormGroup());

    this.curriculumDetail.update((detail) => {
      if (!detail?.curriculum) return detail;

      return {
        ...detail,
        curriculum: {
          ...detail.curriculum,
          projects: [
            ...(detail.curriculum.projects ?? []),
            {
              description: '',
              startDate: '',
              domainOptions: [],
            },
          ],
        },
      };
    });

    this.editingProjectIndex.set(this.projectsArray.length - 1);
  }

  editProject(index: number): void {
    this.editingProjectIndex.set(index);
  }

  removeProject(index: number): void {
    const currentEditing = this.editingProjectIndex();
    this.projectsArray.removeAt(index);

    this.curriculumDetail.update((detail) => {
      if (!detail?.curriculum) return detail;

      const updatedProjects = [...(detail.curriculum.projects ?? [])];
      updatedProjects.splice(index, 1);

      return {
        ...detail,
        curriculum: {
          ...detail.curriculum,
          projects: updatedProjects,
        },
      };
    });

    if (currentEditing === index) {
      this.editingProjectIndex.set(null);
    } else if (currentEditing !== null && currentEditing > index) {
      this.editingProjectIndex.set(currentEditing - 1);
    }
  }

  cancelEditProject(): void {
    const index = this.editingProjectIndex();
    if (index === null) {
      return;
    }

    const originalProject = this.projects()[index];
    if (originalProject) {
      this.projectsArray.setControl(index, this.createProjectFormGroup(originalProject));
    } else {
      this.projectsArray.removeAt(index);

      this.curriculumDetail.update((detail) => {
        if (!detail?.curriculum) return detail;

        const updatedProjects = [...(detail.curriculum.projects ?? [])];
        updatedProjects.splice(index, 1);

        return {
          ...detail,
          curriculum: {
            ...detail.curriculum,
            projects: updatedProjects,
          },
        };
      });
    }

    this.editingProjectIndex.set(null);
  }

  private createEducationFormGroup(education?: EducationDto): FormGroup<EducationFormControls> {
    return new FormGroup<EducationFormControls>({
      educationId: new FormControl<number | undefined>(education?.educationId, {
        nonNullable: true,
      }),
      degreeNameId: new FormControl<number | null>(education?.degreeNameId ?? null, {
        validators: [Validators.required],
      }),
      schoolNameId: new FormControl<number | null>(education?.schoolNameId ?? null, {
        validators: [Validators.required],
      }),
      startDate: new FormControl<Date | null>(
        education?.startDate ? new Date(education.startDate) : null,
        { validators: [Validators.required] }
      ),
      endDate: new FormControl<Date | null>(
        education?.endDate ? new Date(education.endDate) : null
      ),
      grade: new FormControl<number | null>(education?.grade ?? null),
      maxGrade: new FormControl<number | null>(education?.maxGrade ?? null),
    });
  }

  addEducation(): void {
    this.educationHistoryArray.push(this.createEducationFormGroup());

    this.curriculumDetail.update((detail) => {
      if (!detail?.curriculum) return detail;

      return {
        ...detail,
        curriculum: {
          ...detail.curriculum,
          educationHistory: [
            ...(detail.curriculum.educationHistory ?? []),
            {
              startDate: '',
            },
          ],
        },
      };
    });

    this.editingEducationIndex.set(this.educationHistoryArray.length - 1);
  }

  editEducation(index: number): void {
    this.editingEducationIndex.set(index);
  }

  removeEducation(index: number): void {
    const currentEditing = this.editingEducationIndex();
    this.educationHistoryArray.removeAt(index);

    this.curriculumDetail.update((detail) => {
      if (!detail?.curriculum) return detail;

      const updatedEducation = [...(detail.curriculum.educationHistory ?? [])];
      updatedEducation.splice(index, 1);

      return {
        ...detail,
        curriculum: {
          ...detail.curriculum,
          educationHistory: updatedEducation,
        },
      };
    });

    if (currentEditing === index) {
      this.editingEducationIndex.set(null);
    } else if (currentEditing !== null && currentEditing > index) {
      this.editingEducationIndex.set(currentEditing - 1);
    }
  }

  saveEducation(index: number): void {
    const formGroup = this.educationHistoryArray.at(index);
    if (!formGroup.valid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields.',
        life: 3000,
      });
      return;
    }

    const formValue = formGroup.value;
    const updatedEducation: EducationDto = {
      educationId: formValue.educationId,
      degreeNameId: formValue.degreeNameId ?? undefined,
      schoolNameId: formValue.schoolNameId ?? undefined,
      startDate: formValue.startDate ? this.formatDate(formValue.startDate) : '',
      endDate: formValue.endDate ? this.formatDate(formValue.endDate) : undefined,
      grade: formValue.grade ?? undefined,
      maxGrade: formValue.maxGrade ?? undefined,
    };

    this.curriculumDetail.update((detail) => {
      if (!detail?.curriculum) return detail;

      const updatedEducationHistory = [...(detail.curriculum.educationHistory ?? [])];
      updatedEducationHistory[index] = updatedEducation;

      return {
        ...detail,
        curriculum: {
          ...detail.curriculum,
          educationHistory: updatedEducationHistory,
        },
      };
    });

    this.editingEducationIndex.set(null);
    this.messageService.add({
      severity: 'success',
      summary: 'Education Saved',
      detail: 'Education entry has been saved successfully.',
      life: 3000,
    });
  }

  cancelEditEducation(): void {
    const index = this.editingEducationIndex();
    if (index === null) {
      return;
    }

    const originalEducation = this.educationHistory()[index];
    if (originalEducation) {
      this.educationHistoryArray.setControl(
        index,
        this.createEducationFormGroup(originalEducation)
      );
    } else {
      this.educationHistoryArray.removeAt(index);

      this.curriculumDetail.update((detail) => {
        if (!detail?.curriculum) return detail;

        const updatedEducation = [...(detail.curriculum.educationHistory ?? [])];
        updatedEducation.splice(index, 1);

        return {
          ...detail,
          curriculum: {
            ...detail.curriculum,
            educationHistory: updatedEducation,
          },
        };
      });
    }

    this.editingEducationIndex.set(null);
  }

  getProjectSkillChips(
    projectDomainOptions: ProjectDomainOptionDto[] | undefined
  ): { label: string; grade: number }[] {
    if (!projectDomainOptions?.length) {
      return [];
    }
    const idx = this.domainOptionIndex();
    const byLabel = new Map<string, number>();

    for (const p of projectDomainOptions) {
      const label = idx.get(p.domainOptionId);
      if (!label) {
        continue;
      }
      const grade = p.grade ?? 0;
      const prev = byLabel.get(label) ?? 0;
      if (grade > prev) {
        byLabel.set(label, grade);
      }
    }

    return Array.from(byLabel, ([label, grade]) => ({ label, grade }));
  }

  getDegreeName(degreeNameId: number | undefined): string {
    if (!degreeNameId) {
      return 'N/A';
    }
    return this.degreesIndex().get(degreeNameId) ?? `Degree #${degreeNameId}`;
  }

  getSchoolName(schoolNameId: number | undefined): string {
    if (!schoolNameId) {
      return 'N/A';
    }
    return this.schoolsIndex().get(schoolNameId) ?? `School #${schoolNameId}`;
  }

  maxSkillGrade(): number {
    return this.MAX_SKILL_GRADE;
  }

  private formatDate(date: Date | string | null): string {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().split('T')[0];
  }

  private patchUserSkillsForm(): void {
    const userSkillsMap = new Map<number, number>();
    const selectedSkillsMap = new Map<number, number[]>();

    for (const udo of this.user()?.userDomainOptions ?? []) {
      userSkillsMap.set(udo.domainOptionId, udo.grade ?? 0);

      const domain = this.findDomainByOptionId(udo.domainOptionId);
      if (domain) {
        if (!selectedSkillsMap.has(domain.domainId)) {
          selectedSkillsMap.set(domain.domainId, []);
        }
        selectedSkillsMap.get(domain.domainId)!.push(udo.domainOptionId);
      }
    }

    const controls: UserSkillsFormControls = {};

    for (const domain of this.allProjectSkills()) {
      const controlName = this.getDomainFormControlName(domain.domainId);
      controls[controlName] = new FormControl<number[]>(
        selectedSkillsMap.get(domain.domainId) ?? [],
        { nonNullable: true }
      );

      for (const option of domain.domainOptions) {
        const gradeControlName = this.getSkillGradeControlName(option.domainOptionId);
        controls[gradeControlName] = new FormControl<number>(
          userSkillsMap.get(option.domainOptionId) ?? 1,
          {
            validators: [Validators.min(1), Validators.max(this.MAX_SKILL_GRADE)],
            nonNullable: true,
          }
        );
      }
    }

    this.cvForm.setControl('userSkills', new FormGroup(controls));
  }

  getSelectedUserSkillsForDomain(domainId: number): number[] {
    const controlName = this.getDomainFormControlName(domainId);
    return (this.userSkillsForm.get(controlName)?.value as number[]) ?? [];
  }

  getUserSkillChips(): { label: string; grade: number }[] {
    const idx = this.domainOptionIndex();
    const skillsMap = new Map<string, number>();

    for (const domain of this.allProjectSkills()) {
      const selectedIds = this.getSelectedUserSkillsForDomain(domain.domainId);

      for (const optionId of selectedIds) {
        const label = idx.get(optionId);
        if (!label) {
          continue;
        }
        const gradeControlName = this.getSkillGradeControlName(optionId);
        const grade = (this.userSkillsForm.get(gradeControlName)?.value as number) ?? 0;

        const prev = skillsMap.get(label) ?? 0;
        if (grade > prev) {
          skillsMap.set(label, grade);
        }
      }
    }

    return Array.from(skillsMap, ([label, grade]) => ({ label, grade })).sort((a, b) =>
      a.label.localeCompare(b.label)
    );
  }

  saveUserSkills(): void {
    const userSkillsFormValue = this.userSkillsForm.value;
    const userDomainOptions: UserDomainOptionDto[] = [];

    for (const domain of this.allProjectSkills()) {
      const controlName = this.getDomainFormControlName(domain.domainId);
      const selectedSkills = userSkillsFormValue[controlName] as number[] | undefined;

      if (selectedSkills) {
        for (const optionId of selectedSkills) {
          const gradeControlName = this.getSkillGradeControlName(optionId);
          const grade = userSkillsFormValue[gradeControlName] as number | undefined;

          userDomainOptions.push({
            domainId: domain.domainId,
            domainOptionId: optionId,
            grade: grade ?? 1,
          });
        }
      }
    }

    this.curriculumDetail.update((detail) => {
      if (!detail?.user) return detail;

      const updated = {
        ...detail,
        user: {
          ...detail.user,
          userDomainOptions: [...userDomainOptions],
        },
      };

      return updated;
    });

    this.editingUserSkills.set(false);
    this.messageService.add({
      severity: 'success',
      summary: 'Skills Saved',
      detail: 'Your skills have been saved successfully.',
      life: 3000,
    });
  }

  cancelEditUserSkills(): void {
    this.editingUserSkills.set(false);
    this.patchUserSkillsForm();
  }
}
