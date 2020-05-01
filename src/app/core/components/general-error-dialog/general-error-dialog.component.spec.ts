import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralErrorDialogComponent } from './general-error-dialog.component';

describe('GeneralErrorDialogComponent', () => {
  let component: GeneralErrorDialogComponent;
  let fixture: ComponentFixture<GeneralErrorDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralErrorDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralErrorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
