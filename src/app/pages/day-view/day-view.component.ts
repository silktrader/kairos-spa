import { Component, OnInit, Input } from '@angular/core';
import { Day } from 'src/app/models/day';

@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.scss']
})
export class DayViewComponent implements OnInit {
  @Input() day: Day;

  constructor() {}

  ngOnInit(): void {}
}
