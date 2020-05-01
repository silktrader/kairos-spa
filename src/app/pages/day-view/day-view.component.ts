import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { TaskService } from 'src/app/tasks/task.service';
import { Task } from 'src/app/tasks/models/task';
import {
  Subscription,
  Observable,
  BehaviorSubject,
  combineLatest,
  Subject,
} from 'rxjs';
import { Options } from 'sortablejs';
import { MatDialog } from '@angular/material/dialog';
import { EditTaskDialogComponent } from '../../tasks/components/edit-task-dialog/edit-task-dialog.component';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store/app-state';
import { take, map, first, takeUntil } from 'rxjs/operators';
import { HabitEntryDto } from 'src/app/habits/models/habit-entry.dto';
import { HabitDetails } from 'src/app/habits/models/habit.dto';
import { HabitsState } from 'src/app/habits/state/habits.state';
import {
  selectHabits,
  selectHabitsEntries,
} from 'src/app/habits/state/habits.selectors';
import {
  deleteHabitEntry,
  addHabitEntry,
} from 'src/app/habits/state/habits.actions';
import {
  selectLoadingState,
  selectTasksByDate,
  selectTagColour,
} from 'src/app/tasks/state/tasks.selectors';
import { updateTasks, add } from 'src/app/tasks/state/tasks.actions';
import { TasksLoadingState } from 'src/app/tasks/state/tasks.state';
import { addDays, isToday, format } from 'date-fns';
import { TaskDto } from 'src/app/tasks/models/task.dto';
import { interpolateRgb } from 'd3-interpolate';

@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DayViewComponent implements OnInit, OnDestroy {
  @Input() date: Date;
  @ViewChild('addTaskInput') addTaskInput: ElementRef;

  tasks: ReadonlyArray<Task>;
  loadingState$: Observable<TasksLoadingState> = this.store.pipe(
    select(selectLoadingState)
  );
  addingTask$ = new BehaviorSubject<boolean>(false);
  habitsDetails$: Observable<ReadonlyArray<HabitDetails>>;
  habitsPercentage: number;

  tasksLoadingState = TasksLoadingState;

  private subscriptions = new Subscription();
  private ngUnsubscribe$ = new Subject();
  newTaskControl = new FormControl('');
  options: Options; // SortableJs options

  constructor(
    private readonly store: Store<AppState>,
    private readonly habitsStore: Store<HabitsState>,
    private readonly ts: TaskService,
    private editTaskDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.store
        .pipe(
          select(selectTasksByDate, { date: this.date }),
          map(this.ts.sortTasks)
        )
        .subscribe((tasks) => {
          this.tasks = tasks;
        })
    );

    // tk create better selector
    this.habitsDetails$ = combineLatest([
      this.habitsStore.pipe(select(selectHabits)),
      this.habitsStore.pipe(select(selectHabitsEntries, { date: this.date })),
    ]).pipe(
      map(([habits, entries]) => {
        const habitsDetails: Array<HabitDetails> = [];
        for (const habit of habits) {
          habitsDetails.push({
            ...habit,
            entry: entries.find((item) => item.habitId === habit.id),
          });
        }
        return habitsDetails;
      })
    );

    // determine habits percentage
    this.habitsDetails$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((habitsDetails) => {
        let count = 0;
        for (const habitDetail of habitsDetails) {
          if (habitDetail.entry) count += 1;
        }
        this.habitsPercentage = habitsDetails.length
          ? count / habitsDetails.length
          : 0;
      });

    this.options = {
      group: 'draggable-tasks',
      onRemove: (event: any) => {
        const movedTask = this.tasks[event.oldIndex];

        // watch out for the date's timezone
        const targetDate: Date = new Date(event.to.id);
        let targetTasks: ReadonlyArray<Task> = [];

        // get the target date's sorted tasks
        this.store
          .pipe(
            select(selectTasksByDate, {
              date: targetDate,
            }),
            map(this.ts.sortTasks),
            take(1)
          )
          .subscribe((tasks) => {
            targetTasks = tasks;
          });

        // pick the ID above the moved task
        const antecedentId =
          targetTasks.length === 0 || event.newIndex === 0
            ? null
            : targetTasks[event.newIndex - 1].id;

        const updatedTasks = [this.ts.serialise(movedTask)];

        // change the task that references the one being changed
        const orphanTask = this.tasks.find(
          (task) => task.previousId === movedTask.id
        );
        if (orphanTask) {
          updatedTasks.push({
            ...this.ts.serialise(orphanTask),
            previousId: movedTask.previousId,
          });
        }

        // replace the task whose previous ID matches the new reference
        const pushedDown = targetTasks.find(
          (task) => task.previousId === antecedentId
        );
        if (pushedDown) {
          updatedTasks.push({
            ...this.ts.serialise(pushedDown),
            previousId: movedTask.id,
          });
        }

        // finally change the moved task
        updatedTasks[0].date = this.ts.getDateString(targetDate);
        updatedTasks[0].previousId = antecedentId;

        // dispatch the effect
        this.store.dispatch(
          updateTasks({
            tasksDtos: updatedTasks,
          })
        );
      },
      onUpdate: (event: any) => {
        this.changeTaskPosition(event.oldIndex, event.newIndex);
      },
    };
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  promptAddTask(): void {
    this.addingTask$.next(true);
    setTimeout(() => {
      this.addTaskInput.nativeElement.focus();
    }, 0);
  }

  leavePromptAddTask(): void {
    const title = this.newTaskControl.value;
    this.cancelPromptAddTask();
    if (title) {
      this.addTask(title);
    }
  }

  cancelPromptAddTask(): void {
    this.newTaskControl.reset();
    this.addingTask$.next(false);
  }

  addTask(title: string): void {
    // check whether this is the first task
    const previousId =
      this.tasks.length > 0 ? this.tasks[this.tasks.length - 1].id : null;

    this.store.dispatch(
      add({
        task: {
          title,
          previousId,
          date: this.ts.getDateString(this.date),
          details: null,
          complete: false,
          duration: null,
          tags: [],
        },
      })
    );
  }

  private changeTaskPosition(oldIndex: number, newIndex: number): void {
    // the original task being moved around
    const mainTask = this.tasks[oldIndex];

    // when moving down assign the [newIndex].id, when moving up assing the [newIndex - 1].id
    const updatedMainTask = {
      ...this.ts.serialise(mainTask),
      previousId:
        oldIndex < newIndex
          ? this.tasks[newIndex].id
          : newIndex === 0
          ? null
          : this.tasks[newIndex - 1].id,
    };

    // initialise the list of updated tasks with new positions
    const updatedTasks = [updatedMainTask];

    // browse the tasks and mark those whose previous ID needs to be changed
    for (const task of this.tasks) {
      // change the task that referenced the moved task
      if (task.previousId === mainTask.id) {
        updatedTasks.push({
          ...this.ts.serialise(task),
          previousId: mainTask.previousId,
        });
        continue;
      }

      // change the task that referenced the one on top of the moving task
      if (task.previousId === updatedMainTask.previousId) {
        updatedTasks.push({
          ...this.ts.serialise(task),
          previousId: mainTask.id,
        });
      }
    }

    this.store.dispatch(
      updateTasks({
        tasksDtos: updatedTasks,
      })
    );
  }

  public openEditTakDialog(task: Task) {
    this.editTaskDialog.open(EditTaskDialogComponent, {
      data: task,
      panelClass: 'kairos-dialog',
    });
  }

  get isToday(): boolean {
    return isToday(this.date);
  }

  get dayName(): string {
    return format(this.date, 'cccc');
  }

  get daySubtitle(): string {
    return format(this.date, 'LLLL d');
  }

  get dayUrl(): string {
    return this.ts.getDateString(this.date);
  }

  toggleHabit(habitId: number, habitEntry: HabitEntryDto): void {
    if (habitEntry) {
      this.store.dispatch(
        deleteHabitEntry({
          habitEntry,
        })
      );
    } else {
      this.store.dispatch(
        addHabitEntry({ habitEntry: { date: this.date, habitId, comment: '' } })
      );
    }
  }

  private moveTasks(movedTasks: Array<Task>, date: Date): void {
    // fetch tasks via service without changing the state
    // might change behaviour from `append` to `insert`
    this.ts
      .getTasksBetweenDates(date, date)
      .pipe(first())
      .subscribe((tasks: Array<Task>) => {
        let lastTaskId =
          tasks.length > 0
            ? this.ts.sortTasks(tasks)[tasks.length - 1].id
            : null;
        const updatedTasks: Array<TaskDto> = [];

        for (const task of movedTasks) {
          updatedTasks.push({
            ...this.ts.serialise(task),
            date: this.ts.getDateString(date),
            previousId: lastTaskId,
          });
          lastTaskId = task.id;
        }
        this.store.dispatch(
          updateTasks({
            tasksDtos: updatedTasks,
          })
        );
      });
  }

  /* Move incomplete tasks to the following day */
  postponeIncompleteTasks(): void {
    const incompleteTasks = this.tasks.filter((task) => !task.complete);
    const nextDate = addDays(this.date, 1);
    this.moveTasks(incompleteTasks, nextDate);
  }

  /* Move incomplete tasks to the previous day */
  anticipateIncompleteTasks(): void {
    const incompleteTasks = this.tasks.filter((task) => !task.complete);
    const previousDate = addDays(this.date, -1);
    this.moveTasks(incompleteTasks, previousDate);
  }

  badgeCss$(badgeNumber: number, tagName: string) {
    return this.store.select(selectTagColour, { tagName }).pipe(
      map((colour) => {
        const left = `${-30 * badgeNumber}px`;
        const bottom = left;
        const height = `${60 * badgeNumber}px`;
        const width = height;
        return {
          backgroundColor: colour,
          height,
          left,
          bottom,
          width,
          zIndex: -1 * badgeNumber, // display badges below task titles
        };
      })
    );
  }

  colourise(value: number): string {
    return interpolateRgb('rgb(190, 50, 10)', 'rgb(60, 140, 40)')(value);
  }
}
