import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksOrderErrorDialogComponent } from './tasks-order-error-dialog.component';

describe('TasksOrderErrorDialogComponent', () => {
  let component: TasksOrderErrorDialogComponent;
  let fixture: ComponentFixture<TasksOrderErrorDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TasksOrderErrorDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksOrderErrorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
