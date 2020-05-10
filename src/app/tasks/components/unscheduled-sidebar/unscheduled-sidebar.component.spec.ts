import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnscheduledSidebarComponent } from './unscheduled-sidebar.component';

describe('UnscheduledSidebarComponent', () => {
  let component: UnscheduledSidebarComponent;
  let fixture: ComponentFixture<UnscheduledSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnscheduledSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnscheduledSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
