import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { YourCvService } from './service/your-cv-service';
import type { CurriculumDetailDto } from './model/curriculum-detail-dto';
import type { ProjectDomainOptionDto } from './model/project-domain-option-dto';
import type { UserDomainOptionDto } from '../dashboard/model/user-domain-option-dto';
import { ButtonModule } from 'primeng/button';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';

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
  ],
  providers: [MessageService],
})
export class YourCv implements OnInit {
  private readonly yourCvService = inject(YourCvService);
  private readonly messageService = inject(MessageService);

  private readonly MAX_SKILL_GRADE = 5 as const;

  readonly curriculumDetail = signal<CurriculumDetailDto | null>(null);

  readonly user = computed(() => this.curriculumDetail()?.user);
  readonly curriculum = computed(() => this.curriculumDetail()?.curriculum ?? null);
  readonly domains = computed(() => this.curriculumDetail()?.domains ?? []);
  readonly schools = computed(() => this.curriculumDetail()?.schools ?? []);
  readonly degrees = computed(() => this.curriculumDetail()?.degrees ?? []);
  readonly educationHistory = computed(() => this.curriculum()?.educationHistory ?? []);
  readonly projects = computed(() => this.curriculum()?.projects ?? []);
  readonly curriculumSkillItems = computed(
    () => (this.curriculum()?.domainOptions ?? []) as ProjectDomainOptionDto[]
  );

  readonly domainOptionIndex = computed(() => {
    const map = new Map<number, string>();
    for (const d of this.domains())
      for (const o of d.domainOptions) map.set(o.domainOptionId, o.value);
    return map;
  });
  readonly schoolsIndex = computed(() => {
    const map = new Map<number, string>();
    for (const s of this.schools()) map.set(s.domainOptionId, s.value);
    return map;
  });
  readonly degreesIndex = computed(() => {
    const map = new Map<number, string>();
    for (const d of this.degrees()) map.set(d.domainOptionId, d.value);
    return map;
  });

  readonly allSkills = computed(() => {
    const idx = this.domainOptionIndex();
    const best = new Map<number, { label: string; grade: number }>();

    for (const raw of this.curriculumSkillItems()) {
      const id = raw.domainOptionId;
      const grade = raw.grade ?? 0;
      const label = idx.get(id);
      if (!label) continue;
      const prev = best.get(id)?.grade ?? 0;
      if (grade > prev) best.set(id, { label, grade });
    }

    for (const udo of (this.user()?.userDomainOptions ?? []) as UserDomainOptionDto[]) {
      const id = udo.domainOptionId;
      const grade = udo.grade ?? 0;
      const label = idx.get(id);
      if (!label) continue;
      const prev = best.get(id)?.grade ?? 0;
      if (grade > prev) best.set(id, { label, grade });
    }

    return Array.from(best.values()).sort((a, b) => a.label.localeCompare(b.label));
  });

  readonly drivingLicenseLabel = computed(() => {
    const dl = this.curriculum()?.drivingLicense;
    if (dl === null || dl === undefined || dl === 0) return 'No Driving License';
    return String(dl);
  });

  readonly isEditMode = signal<boolean>(false);

  readonly cvForm = new FormGroup({
    summary: new FormControl<string>(''),
    mobilePhone: new FormControl<string>(''),
    homeAddress: new FormControl<string>(''),
    workAddress: new FormControl<string>(''),
    maritalStatus: new FormControl<boolean>(false, { nonNullable: true }),
    drivingLicense: new FormControl<number | null>(null),
    hasCar: new FormControl<boolean>(false, { nonNullable: true }),
    openForTravel: new FormControl<boolean>(false, { nonNullable: true }),
  });

  toggleEditMode(): void {
    const next = !this.isEditMode();
    this.isEditMode.set(next);
    if (next) this.patchFormFromCurriculum();
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
  }

  ngOnInit(): void {
    this.curriculumDetail.set(null);
    this.yourCvService.getCurriculumDetailsForCurrentUser().subscribe({
      next: (data) => this.curriculumDetail.set(data),
      error: (err: HttpErrorResponse | Error) => {
        const is404 = err instanceof HttpErrorResponse && err.status === 404;
        this.messageService.add({
          severity: 'error',
          summary: 'Error Loading CV',
          detail: is404
            ? 'No curriculum found. Please create your CV first.'
            : 'Failed to load CV data.',
          life: 5000,
        });
      },
    });
  }

  getProjectSkillChips(
    projectDomainOptions: ProjectDomainOptionDto[] | undefined
  ): { label: string; grade: number }[] {
    if (!projectDomainOptions?.length) return [];
    const idx = this.domainOptionIndex();
    const byLabel = new Map<string, number>();
    for (const p of projectDomainOptions) {
      const label = idx.get(p.domainOptionId);
      if (!label) continue;
      byLabel.set(label, Math.max(byLabel.get(label) ?? 0, p.grade ?? 0));
    }
    return Array.from(byLabel, ([label, grade]) => ({ label, grade }));
  }

  getDegreeName(degreeNameId: number | undefined): string {
    if (!degreeNameId) return 'Unknown Degree';
    return this.degreesIndex().get(degreeNameId) ?? `Degree #${degreeNameId}`;
  }

  getSchoolName(schoolNameId: number | undefined): string {
    if (!schoolNameId) return 'Unknown School';
    return this.schoolsIndex().get(schoolNameId) ?? `School #${schoolNameId}`;
  }

  maxSkillGrade(): number {
    return this.MAX_SKILL_GRADE;
  }
}
