import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HuePickerComponent } from './hue-picker.component';

describe('HuePickerComponent', () => {
  let component: HuePickerComponent;
  let fixture: ComponentFixture<HuePickerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HuePickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HuePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
