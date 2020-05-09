import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SigninPromptComponent } from './signin-prompt.component';

describe('SigninPromptComponent', () => {
  let component: SigninPromptComponent;
  let fixture: ComponentFixture<SigninPromptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SigninPromptComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SigninPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
