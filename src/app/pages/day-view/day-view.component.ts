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
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { Options } from 'sortablejs';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store/app-state';
import { map, first, takeUntil } from 'rxjs/operators';
import { HabitEntryDto } from 'src/app/habits/models/habit-entry.dto';
import { HabitsState } from 'src/app/habits/state/habits.state';
import { selectHabitsDetails } from 'src/app/habits/state/habits.selectors';
import {
  deleteHabitEntry,
  addHabitEntry,
} from 'src/app/habits/state/habits.actions';
import {
  selectLoadingState,
  selectTasksByDate,
} from 'src/app/tasks/state/tasks.selectors';
import { updateTasks, add } from 'src/app/tasks/state/tasks.actions';
import { TasksLoadingState } from 'src/app/tasks/state/tasks.state';
import { addDays, isToday, format } from 'date-fns';
import { TaskDto } from 'src/app/tasks/models/task.dto';
import { interpolateRgb } from 'd3-interpolate';
import { HabitDetails } from 'src/app/habits/models/habit.dto';
import { tagConstraints } from 'src/app/tasks/models/tag.dto';
import { NotificationService } from 'src/app/services/notification.service';

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
  handlingError = false;

  loadingState$: Observable<TasksLoadingState> = this.store.pipe(
    select(selectLoadingState)
  );
  addingTask$ = new BehaviorSubject<boolean>(false);
  habitsDetails$: Observable<ReadonlyArray<HabitDetails>>;
  habitsPercentage: number;

  tasksLoadingState = TasksLoadingState;

  private ngUnsubscribe$ = new Subject();
  newTaskControl = new FormControl('');
  options: Options; // SortableJs options

  constructor(
    private readonly store: Store<AppState>,
    private readonly habitsStore: Store<HabitsState>,
    private readonly ts: TaskService,
    private readonly ns: NotificationService
  ) {}

  ngOnInit(): void {
    this.store
      .select(selectTasksByDate, { date: this.date })
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((tasks) => {
        // an alternative to catching errors synchronously would be use RxJS' catchError and switchMap to keep the main observable alive
        // tasks need to be stored locally anyway so a try-catch block is relevant
        try {
          this.tasks = this.ts.sortTasks(tasks);
          this.handlingError = false;
        } catch (error) {
          // the selector will trigger various updates; this is how we prevent multiple dialogs (less than ideal)
          if (this.handlingError) return;
          this.handlingError = true;
          this.ns.warnTasksOrderError(this.date);
          this.tasks = [];
        }
      });

    // must run during onInit to ensure the date is set before
    this.habitsDetails$ = this.habitsStore.select(selectHabitsDetails, {
      date: this.date,
    });

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
      group: 'draggable-tasks', // tk export
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
            first(),
            map(this.ts.sortTasks)
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
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  private parseInput(input: string): { title: string; tags: Array<string> } {
    if (!input) return { title: '', tags: [] };

    const tags = [];
    let title = '';
    for (const block of input.split(' ')) {
      // remove the '#' and force lowercase
      if (block.startsWith('#')) tags.push(block.substring(1).toLowerCase());
      else {
        title += block + ' ';
      }
    }

    // there will always be a last space, this also takes care of rogue initial ones
    title = title.trim();

    return { title, tags };
  }

  promptAddTask(): void {
    this.addingTask$.next(true);
    setTimeout(() => {
      this.addTaskInput.nativeElement.focus();
    }, 0);
  }

  confirmPromptTask(): void {
    const { title, tags } = this.parseInput(this.newTaskControl.value);

    // ensure that titles abide to length rules
    if (title.length > 50 || title.length < 5) {
      this.newTaskControl.setErrors({ titleLength: true });
      console.log(this.newTaskControl.valid);
      return;
    }

    // ensure that tag names are valid
    for (const tagName of tags) {
      if (
        tagName.length > tagConstraints.maxLength ||
        tagName.length < tagConstraints.minLength
      ) {
        this.newTaskControl.setErrors({ tagLength: true });
        return;
      }
    }

    this.cancelPromptAddTask();
    this.addTask({ title, tags });
  }

  cancelPromptAddTask(): void {
    this.newTaskControl.reset();
    this.addingTask$.next(false);
  }

  get titleErrorMessage(): string {
    return 'Titles length must be within 5 and  50 characters';
  }

  get tagsErrorMessage(): string {
    return `Hashtags length must be within ${tagConstraints.minLength} and ${tagConstraints.maxLength} characters`;
  }

  addTask({ title, tags }: { title: string; tags: Array<string> }): void {
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
          tags,
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

  colourise(value: number): string {
    return interpolateRgb('rgb(190, 50, 10)', 'rgb(60, 140, 40)')(value);
  }
}
