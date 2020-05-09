import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { addDays } from 'date-fns';
import { Observable, Subject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { SidebarSection, AppState } from 'src/app/store/app-state';
import { toggleSidebar, setVisibleDates } from 'src/app/store/schedule.actions';
import { MatSidenav } from '@angular/material/sidenav';
import {
  selectSidebar,
  selectVisibleDates,
} from 'src/app/store/schedule.selectors';
import { delay, takeUntil, first } from 'rxjs/operators';
import {
  getHabits,
  getHabitsEntries,
} from 'src/app/habits/state/habits.actions';
import { NotificationService } from 'src/app/services/notification.service';
import * as TasksActions from 'src/app/tasks/state/tasks.actions';
import { formatDate } from 'src/app/core/format-date';
import { AuthService } from 'src/app/auth/auth.service';
import {
  ShortcutInput,
  ShortcutEventOutput,
  KeyboardShortcutsComponent,
} from 'ng-keyboard-shortcuts';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('sidebar') sidebar: MatSidenav;

  private readonly ngUnsubscribe$ = new Subject();
  public readonly visibleDates$ = this.store.select(selectVisibleDates);
  public readonly user$ = this.authService.user$;

  public sidebarState$: Observable<{
    opened: boolean;
    section: SidebarSection;
  }> = this.store.pipe(select(selectSidebar));
  private previousSidebarState: { opened: boolean; section: SidebarSection };
  public sidebarSection = SidebarSection;

  public shortcuts = new Array<ShortcutInput>();

  constructor(
    private readonly authService: AuthService,
    private readonly store: Store<AppState>,
    private readonly ns: NotificationService, // needed to start up the service,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  // tk should be conditional on sign in
  ngOnInit(): void {
    // get the available habits, needs not be tied with the dates' changes
    this.store.dispatch(getHabits());

    // get available tags
    this.store.dispatch(TasksActions.getTags());

    // get all timers
    this.store.dispatch(TasksActions.getTimers());

    // get tasks and habits entries
    this.store
      .pipe(select(selectVisibleDates), takeUntil(this.ngUnsubscribe$))
      .subscribe((dates: Array<string>) => {
        // avoid calls when no dates are set
        if (dates.length > 0) {
          this.store.dispatch(TasksActions.get({ dates }));
          this.store.dispatch(getHabitsEntries({ dates }));
        }
      });

    this.showToday();
  }

  ngAfterViewInit(): void {
    // must run after the onInit cycle to catch the sidenav element
    // the delay fixes the `ExpressionChangedAfterItHasBeenCheckedError`
    this.sidebarState$
      .pipe(delay(0), takeUntil(this.ngUnsubscribe$))
      .subscribe((sidebarState) => {
        sidebarState.opened ? this.sidebar.open() : this.sidebar.close();

        // must check for changes when the strategy is set to `onPush`
        this.changeDetectorRef.detectChanges();
        this.previousSidebarState = sidebarState;
      });

    // define shortcuts
    this.shortcuts.push(
      {
        key: ['ctrl + left'],
        label: 'Schedule Navigation',
        description: 'Show the previous date',
        preventDefault: true,
        command: () => this.showPrevious(),
      },
      {
        key: ['ctrl + right'],
        label: 'Schedule Navigation',
        description: 'Show the next date',
        preventDefault: true,
        command: () => {
          this.showNext();
          console.log('asd');
        },
      }
    );
  }

  ngOnDestroy(): void {
    // the home component is the root component so far, unsubscriptions aren't actually needed
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  private consecutiveDates(start: Date, period: number): ReadonlyArray<string> {
    const dates = [formatDate(start)];
    for (let i = 1; i < 5; i++) {
      dates.push(formatDate(addDays(start, i)));
    }
    return dates;
  }

  public showPrevious(): void {
    this.visibleDates$.pipe(first()).subscribe((oldDates) => {
      const dates = this.consecutiveDates(
        addDays(new Date(oldDates[0]), -1),
        5
      );
      this.store.dispatch(setVisibleDates({ dates }));
    });
  }

  public showNext(): void {
    this.visibleDates$.pipe(first()).subscribe((oldDates) => {
      const dates = this.consecutiveDates(addDays(new Date(oldDates[0]), 1), 5);
      this.store.dispatch(setVisibleDates({ dates }));
    });
  }

  public showToday(): void {
    this.store.dispatch(setVisibleDates({ dates: this.currentPeriod() }));
  }

  private currentPeriod(): ReadonlyArray<string> {
    const start = addDays(new Date(), -2);
    return this.consecutiveDates(start, 5);
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
