import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-hue-picker',
  templateUrl: './hue-picker.component.html',
  styleUrls: ['./hue-picker.component.scss'],
})
export class HuePickerComponent implements OnInit {
  @Input() hue: number;

  constructor() {}

  ngOnInit(): void {}
}
