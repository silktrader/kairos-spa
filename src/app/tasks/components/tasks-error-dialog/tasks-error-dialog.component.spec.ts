import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksErrorDialogComponent } from './tasks-error-dialog.component';

describe('TasksErrorDialogComponent', () => {
  let component: TasksErrorDialogComponent;
  let fixture: ComponentFixture<TasksErrorDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TasksErrorDialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksErrorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
