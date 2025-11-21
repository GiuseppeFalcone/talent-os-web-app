import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YourEmployee } from './your-employee';

describe('YourEmployee', () => {
  let component: YourEmployee;
  let fixture: ComponentFixture<YourEmployee>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YourEmployee]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YourEmployee);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
