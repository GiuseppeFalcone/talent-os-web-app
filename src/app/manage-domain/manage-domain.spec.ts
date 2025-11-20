import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageDomain } from './manage-domain';

describe('ManageDomain', () => {
  let component: ManageDomain;
  let fixture: ComponentFixture<ManageDomain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageDomain]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageDomain);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
