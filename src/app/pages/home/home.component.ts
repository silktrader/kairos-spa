import { Component, OnInit } from '@angular/core';
import { Day } from 'src/app/models/day';
import { addDays, isToday } from 'date-fns';
import { DayService } from 'src/app/services/day.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public displayedDays: ReadonlyArray<Day>;

  constructor(private ds: DayService) {}

  ngOnInit(): void {
    this.buildInitialView();
  }

  public showPrevious(): void {
    const days = [...this.displayedDays];
    days.pop();
    days.unshift(this.ds.getDayBefore(days[0].date));
    this.displayedDays = days;
  }

  public showNext(): void {
    const days = [...this.displayedDays];
    days.shift();
    days.push(this.ds.getDayAfter(days[days.length - 1].date));
    this.displayedDays = days;
  }

  private buildInitialView(): void {
    const initialDate = addDays(new Date(), -2);
    const displayedDates = [];

    for (let index = 0; index < 5; index++) {
      displayedDates.push(this.ds.getDay(addDays(initialDate, index)));
    }

    this.displayedDays = displayedDates;
  }
}
