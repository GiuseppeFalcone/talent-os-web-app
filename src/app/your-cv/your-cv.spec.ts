import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YourCv } from './your-cv';

describe('YourCv', () => {
  let component: YourCv;
  let fixture: ComponentFixture<YourCv>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YourCv]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YourCv);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
