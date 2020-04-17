import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddHabitDialogComponent } from './add-habit-dialog.component';

describe('AddHabitDialogComponent', () => {
  let component: AddHabitDialogComponent;
  let fixture: ComponentFixture<AddHabitDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddHabitDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddHabitDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
