import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditHabitDialogComponent } from './edit-habit-dialog.component';

describe('EditHabitDialogComponent', () => {
  let component: EditHabitDialogComponent;
  let fixture: ComponentFixture<EditHabitDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditHabitDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditHabitDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
