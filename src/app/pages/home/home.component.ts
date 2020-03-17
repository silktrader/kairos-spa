import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'auth';
import { addDays } from 'date-fns';
import { DayService } from 'src/app/services/day.service';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly visibleDates$$: BehaviorSubject<ReadonlyArray<Date>>;
  public readonly visibleDates$: Observable<ReadonlyArray<Date>>;

  public readonly user$ = this.authService.user$;

  private readonly subscriptions = new Subscription();

  constructor(
    private readonly ds: DayService,
    private readonly authService: AuthService
  ) {
    this.visibleDates$$ = new BehaviorSubject<ReadonlyArray<Date>>(
      this.initialDates()
    );
    this.visibleDates$ = this.visibleDates$$.asObservable();
  }

  private get currentDates() {
    return this.visibleDates$$?.value;
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.visibleDates$$.subscribe(dates =>
        this.ds.getTasksBetweenDates(dates[0], dates[dates.length - 1])
      )
    );
  }

  ngOnDestroy(): void {
    // the home component is the root component so far, unsubscriptions aren't actually needed
    this.subscriptions.unsubscribe();
  }

  public showPrevious(): void {
    this.visibleDates$$.next([
      this.ds.getDateBefore(this.currentDates[0]),
      ...this.currentDates.slice(0, this.currentDates.length - 1)
    ]);
  }

  public showNext(): void {
    this.visibleDates$$.next([
      ...this.currentDates.slice(1, this.currentDates.length - 1),
      this.ds.getDateAfter(this.currentDates[length - 1])
    ]);
  }

  private initialDates(): ReadonlyArray<Date> {
    const initialDate = addDays(new Date(), -2);
    const initialDates: Array<Date> = [];

    for (let index = 0; index < 5; index++) {
      initialDates.push(addDays(initialDate, index));
    }

    return initialDates;
  }

  handleSignout(): void {
    this.authService.signout();
  }
}
