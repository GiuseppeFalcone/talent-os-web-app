import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { YourCvService } from './service/you-cv-service';
import { PrimeTemplate } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { TimelineModule } from 'primeng/timeline';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-your-cv',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PrimeTemplate,
    ButtonModule,
    CardModule,
    ChipModule,
    TimelineModule,
    InputTextModule,
    TextareaModule,
    CheckboxModule,
    DatePickerModule,
    AvatarModule,
    DividerModule,
  ],
  templateUrl: './your-cv.html',
  styleUrl: './your-cv.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YourCv {
  private readonly yourCvService = inject(YourCvService);
  private readonly fb = inject(FormBuilder);

  readonly isEditMode = signal(false);

  private readonly viewModel = toSignal(this.yourCvService.getCurriculumDetailsForCurrentUser(), {
    initialValue: null,
  });

  readonly curriculum = computed(() => this.viewModel()?.curriculum);
  readonly domains = computed(() => this.viewModel()?.domains ?? []);
  readonly user = computed(() => this.viewModel()?.user);

  readonly educationHistory = computed(() => {
    const history = this.curriculum()?.educationHistory ?? [];
    return [...history].sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return dateB - dateA;
    });
  });

  readonly projects = computed(() => {
    const projectList = this.curriculum()?.projects ?? [];
    return [...projectList].sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return dateB - dateA;
    });
  });

  readonly personalSkills = computed(() => this.curriculum()?.domainOptions ?? []);

  readonly cvForm = computed(() => {
    const cv = this.curriculum();
    if (!cv) return null;

    return this.fb.group({
      mobilePhone: [cv.mobilePhone],
      homeAddress: [cv.homeAddress],
      workAddress: [cv.workAddress],
      maritalStatus: [cv.maritalStatus],
      drivingLicense: [cv.drivingLicense],
      hasCar: [cv.hasCar],
      openForTravel: [cv.openForTravel],
      summary: [cv.summary],
    });
  });

  toggleEditMode(): void {
    this.isEditMode.update((mode) => !mode);
  }

  saveChanges(): void {
    if (!this.cvForm()?.valid) {
      return;
    }

    const formValue = this.cvForm()?.value;
    console.log('Saving CV changes:', formValue);

    // TODO: Implement actual save request
    // this.yourCvService.updateCurriculum(formValue).subscribe(...)

    this.isEditMode.set(false);
  }

  getDomainName(domainId: number): string {
    const domain = this.domains().find((d) => d.domainId === domainId);
    return domain?.domainName ?? '';
  }

  getDomainOptionName(domainId: number, optionId: number): string {
    const domain = this.domains().find((d) => d.domainId === domainId);
    if (!domain) return '';

    const option = domain.domainOptions.find((o) => o.domainOptionId === optionId);
    return option?.value ?? '';
  }

  getSchoolName(schoolNameId: number): string {
    // TODO: Implement school name lookup from service
    return `School ${schoolNameId}`;
  }

  getDegreeName(degreeNameId: number): string {
    // TODO: Implement degree name lookup from service
    return `Degree ${degreeNameId}`;
  }
}
