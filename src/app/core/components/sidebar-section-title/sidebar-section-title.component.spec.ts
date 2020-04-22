import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarSectionTitleComponent } from './sidebar-section-title.component';

describe('SidebarSectionTitleComponent', () => {
  let component: SidebarSectionTitleComponent;
  let fixture: ComponentFixture<SidebarSectionTitleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarSectionTitleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarSectionTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
