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
  getDatesTasks,
  toggleSidebar,
  getHabitsEntries,
  getHabits,
} from 'src/app/store/schedule.actions';
import { MatSidenav } from '@angular/material/sidenav';
import { selectSidebar } from 'src/app/store/schedule.selectors';

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

  constructor(
    private readonly ds: DayService,
    private readonly authService: AuthService,
    private readonly store: Store<AppState>
  ) {
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

    this.subscriptions.add(
      this.visibleDates$.subscribe((dates) => {
        const dateRange = {
          startDate: dates[0],
          endDate: dates[dates.length - 1],
        };

        this.store.dispatch(getDatesTasks(dateRange));

        this.store.dispatch(getHabitsEntries(dateRange));
      })
    );
  }

  ngAfterViewInit(): void {
    // must run after the onInit cycle to catch the sidenav element
    this.subscriptions.add(
      this.sidebarState$.subscribe((sidebarState) => {
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

  private toggleSidebarSection(section: SidebarSection): void {
    if (
      this.previousSidebarState.opened &&
      this.previousSidebarState.section === section
    ) {
      this.store.dispatch(toggleSidebar({ opened: false, section }));
      return;
    }

    this.store.dispatch(toggleSidebar({ opened: true, section }));
  }

  toggleEventsSidebar(): void {
    this.toggleSidebarSection(SidebarSection.Events);
  }

  toggleHabitsSidebar(): void {
    this.toggleSidebarSection(SidebarSection.Habits);
  }
}
