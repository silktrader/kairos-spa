import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'auth';
import { addDays } from 'date-fns';
import { DayService } from 'src/app/services/day.service';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { ScheduleState } from 'src/app/store/schedule';
import { getDatesTasks } from 'src/app/store/schedule.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly visibleDates$$: BehaviorSubject<ReadonlyArray<Date>>;
  public readonly visibleDates$: Observable<ReadonlyArray<Date>>;

  public readonly user$ = this.authService.user$;

  private readonly subscriptions = new Subscription();

  constructor(
    private readonly ds: DayService,
    private readonly authService: AuthService,
    private readonly store: Store<ScheduleState>,
    private readonly router: Router
  ) {
    this.visibleDates$$ = new BehaviorSubject<ReadonlyArray<Date>>(
      this.currentDates()
    );
    this.visibleDates$ = this.visibleDates$$.asObservable();
  }

  private get visibleDates() {
    return this.visibleDates$$?.value;
  }

  ngOnInit(): void {
    // tk should be conditional on sign in

    this.subscriptions.add(
      this.visibleDates$.subscribe((dates) => {
        this.store.dispatch(
          getDatesTasks({
            startDate: dates[0],
            endDate: dates[dates.length - 1],
          })
        );
      })
    );
  }

  ngOnDestroy(): void {
    // the home component is the root component so far, unsubscriptions aren't actually needed
    this.subscriptions.unsubscribe();
  }

  public showPrevious(): void {
    this.visibleDates$$.next([
      this.ds.getDateBefore(this.visibleDates[0]),
      ...this.visibleDates.slice(0, this.visibleDates.length - 1),
    ]);
  }

  public showNext(): void {
    this.visibleDates$$.next([
      ...this.visibleDates.slice(1),
      this.ds.getDateAfter(this.visibleDates[this.visibleDates.length - 1]),
    ]);
  }

  public showToday(): void {
    this.visibleDates$$.next(this.currentDates());
  }

  private currentDates(): ReadonlyArray<Date> {
    const initialDate = addDays(new Date().setUTCHours(0, 0, 0, 0), -2);
    const currentDates: Array<Date> = [];

    for (let index = 0; index < 5; index++) {
      currentDates.push(addDays(initialDate, index));
    }

    return currentDates;
  }

  handleSignout(): void {
    this.authService.signout();
  }
}
