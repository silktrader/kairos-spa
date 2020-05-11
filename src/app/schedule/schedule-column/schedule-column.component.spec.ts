import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleColumnComponent } from './schedule-column.component';

describe('ScheduleColumnComponent', () => {
  let component: ScheduleColumnComponent;
  let fixture: ComponentFixture<ScheduleColumnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ScheduleColumnComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
