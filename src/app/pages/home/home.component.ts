import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { AuthService } from 'auth';
import { addDays, isSameDay } from 'date-fns';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
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
  selectVisibleDates,
} from 'src/app/store/schedule.selectors';
import { delay, takeUntil, map, first } from 'rxjs/operators';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('sidebar') sidebar: MatSidenav;

  private readonly ngUnsubscribe$ = new Subject();
  public readonly visiblePeriod$ = this.store.select(selectVisiblePeriod);
  public readonly visibleDates$ = this.store.select(selectVisibleDates);
  public readonly user$ = this.authService.user$;

  public sidebarState$: Observable<{
    opened: boolean;
    section: SidebarSection;
  }> = this.store.pipe(select(selectSidebar));
  private previousSidebarState: { opened: boolean; section: SidebarSection };
  public sidebarSection = SidebarSection;

  constructor(
    private readonly authService: AuthService,
    private readonly store: Store<AppState>,
    private readonly ns: NotificationService // needed to start up the service
  ) {}

  // tk should be conditional on sign in
  ngOnInit(): void {
    // get the available habits, needs not be tied with the dates' changes
    this.store.dispatch(getHabits());

    // get available tags
    this.store.dispatch(TasksActions.getTags());

    // get tasks and habits entries
    this.store
      .pipe(select(selectVisiblePeriod), takeUntil(this.ngUnsubscribe$))
      .subscribe((period) => {
        this.store.dispatch(TasksActions.get(period));
        this.store.dispatch(getHabitsEntries(period));
      });

    this.store.dispatch(setVisiblePeriod(this.currentPeriod()));
  }

  ngAfterViewInit(): void {
    // must run after the onInit cycle to catch the sidenav element
    // the delay fixes the `ExpressionChangedAfterItHasBeenCheckedError`
    this.sidebarState$
      .pipe(delay(0), takeUntil(this.ngUnsubscribe$))
      .subscribe((sidebarState) => {
        sidebarState.opened ? this.sidebar.open() : this.sidebar.close();
        this.previousSidebarState = sidebarState;
      });
  }

  ngOnDestroy(): void {
    // the home component is the root component so far, unsubscriptions aren't actually needed
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public showPrevious(): void {
    this.visiblePeriod$.pipe(first()).subscribe((period) => {
      this.store.dispatch(
        setVisiblePeriod({
          startDate: addDays(period.startDate, -1),
          endDate: addDays(period.endDate, -1),
        })
      );
    });
  }

  public showNext(): void {
    this.visiblePeriod$.pipe(first()).subscribe((period) => {
      this.store.dispatch(
        setVisiblePeriod({
          startDate: addDays(period.startDate, 1),
          endDate: addDays(period.endDate, 1),
        })
      );
    });
  }

  public showToday(): void {
    this.store.dispatch(setVisiblePeriod(this.currentPeriod()));
  }

  private currentPeriod(): { startDate: Date; endDate: Date } {
    const today = new Date();
    return {
      startDate: addDays(today, -2),
      endDate: addDays(today, 2),
    };
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
