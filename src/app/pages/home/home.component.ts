import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { AuthService } from 'auth';
import { addDays } from 'date-fns';
import { DayService } from 'src/app/services/day.service';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { SidebarSection, AppState } from 'src/app/store/app-state';
import {
  toggleSidebar,
  setVisiblePeriod,
} from 'src/app/store/schedule.actions';
import { MatSidenav } from '@angular/material/sidenav';
import {
  selectSidebar,
  selectVisiblePeriod,
} from 'src/app/store/schedule.selectors';
import { delay } from 'rxjs/operators';
import {
  getHabits,
  getHabitsEntries,
} from 'src/app/habits/state/habits.actions';
import { NotificationService } from 'src/app/services/notification.service';
import * as TasksActions from 'src/app/tasks/state/tasks.actions';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('sidebar') sidebar: MatSidenav;

  private readonly visibleDates$$: BehaviorSubject<ReadonlyArray<Date>>;
  public readonly visibleDates$: Observable<ReadonlyArray<Date>>;

  public readonly user$ = this.authService.user$;

  private readonly subscriptions = new Subscription();

  public sidebarState$: Observable<{
    opened: boolean;
    section: SidebarSection;
  }>;
  private previousSidebarState: { opened: boolean; section: SidebarSection };
  public sidebarSection = SidebarSection;

  constructor(
    private readonly ds: DayService,
    private readonly authService: AuthService,
    private readonly store: Store<AppState>,
    private readonly ns: NotificationService // needed to start up the service
  ) {
    // tk remove this and rely on the store's selector
    this.visibleDates$$ = new BehaviorSubject<ReadonlyArray<Date>>(
      this.currentDates()
    );
    this.visibleDates$ = this.visibleDates$$.asObservable();
    this.sidebarState$ = this.store.pipe(select(selectSidebar));
  }

  private get visibleDates() {
    return this.visibleDates$$?.value;
  }

  // tk should be conditional on sign in
  ngOnInit(): void {
    // get the available habits, needs not be tied with the dates' changes
    this.store.dispatch(getHabits());

    // get available tags
    this.store.dispatch(TasksActions.getTags());

    this.subscriptions.add(
      this.visibleDates$.subscribe((dates) => {
        const dateRange = {
          startDate: dates[0],
          endDate: dates[dates.length - 1],
        };

        this.store.dispatch(setVisiblePeriod(dateRange));
      })
    );

    this.subscriptions.add(
      this.store.pipe(select(selectVisiblePeriod)).subscribe((dateRange) => {
        if (!dateRange) return;
        this.store.dispatch(TasksActions.get(dateRange));
        this.store.dispatch(getHabitsEntries(dateRange));
      })
    );
  }

  ngAfterViewInit(): void {
    // must run after the onInit cycle to catch the sidenav element
    this.subscriptions.add(
      // the delay fixes the `ExpressionChangedAfterItHasBeenCheckedError`
      this.sidebarState$.pipe(delay(0)).subscribe((sidebarState) => {
        sidebarState.opened ? this.sidebar.open() : this.sidebar.close();
        this.previousSidebarState = sidebarState;
      })
    );
  }

  ngOnDestroy(): void {
    // the home component is the root component so far, unsubscriptions aren't actually needed
    this.subscriptions.unsubscribe();
  }

  public showPrevious(): void {
    this.visibleDates$$.next([
      addDays(this.visibleDates[0], -1),
      ...this.visibleDates.slice(0, this.visibleDates.length - 1),
    ]);
  }

  public showNext(): void {
    this.visibleDates$$.next([
      ...this.visibleDates.slice(1),
      addDays(this.visibleDates[this.visibleDates.length - 1], 1),
    ]);
  }

  public showToday(): void {
    this.visibleDates$$.next(this.currentDates());
  }

  private currentDates(): ReadonlyArray<Date> {
    //const initialDate = addDays(new Date().setUTCHours(0, 0, 0, 0), -2);
    const initialDate = addDays(new Date(), -2);
    const currentDates: Array<Date> = [];

    for (let index = 0; index < 5; index++) {
      currentDates.push(addDays(initialDate, index));
    }

    return currentDates;
  }

  handleSignout(): void {
    this.authService.signout();
  }

  public toggleSidebarSection(section: SidebarSection): void {
    if (
      this.previousSidebarState.opened &&
      this.previousSidebarState.section === section
    ) {
      this.store.dispatch(toggleSidebar({ opened: false, section }));
      return;
    }

    this.store.dispatch(toggleSidebar({ opened: true, section }));
  }
}
