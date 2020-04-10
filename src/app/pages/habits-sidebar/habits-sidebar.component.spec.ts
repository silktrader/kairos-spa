import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HabitsSidebarComponent } from './habits-sidebar.component';

describe('HabitsSidebarComponent', () => {
  let component: HabitsSidebarComponent;
  let fixture: ComponentFixture<HabitsSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HabitsSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HabitsSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
