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
import { updateTasks, addTask } from 'src/app/tasks/state/tasks.actions';
import { TasksLoadingState } from 'src/app/tasks/state/tasks.state';
import { addDays, isToday, format } from 'date-fns';
import { TaskDto } from 'src/app/tasks/models/task.dto';
import { interpolateRgb } from 'd3-interpolate';
import { HabitDetails } from 'src/app/habits/models/habit.dto';
import { tagConstraints } from 'src/app/tasks/models/tag.dto';
import { NotificationService } from 'src/app/services/notification.service';
import { formatDate } from 'src/app/core/format-date';

@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DayViewComponent implements OnInit, OnDestroy {
  @Input() date: string;
  private dateObject: Date;

  @ViewChild('addTaskInput') addTaskInput: ElementRef;

  tasks: ReadonlyArray<TaskDto>;
  handlingError = false;

  loadingState$: Observable<TasksLoadingState>;

  addingTask$ = new BehaviorSubject<boolean>(false);
  habitsDetails$: Observable<ReadonlyArray<HabitDetails>>;
  habitsPercentage: number;

  tasksLoadingState = TasksLoadingState;

  private ngUnsubscribe$ = new Subject();
  newTaskControl = new FormControl('');
  options: Options; // SortableJs options
  readonly draggableTasksIdentifier = 'draggableTasks';

  constructor(
    private readonly store: Store<AppState>,
    private readonly habitsStore: Store<HabitsState>,
    private readonly ts: TaskService,
    private readonly ns: NotificationService
  ) {}

  ngOnInit(): void {
    // store date object to avoid constant parsing
    this.dateObject = new Date(this.date);

    // ensure that date is initialised before calling the selector
    this.loadingState$ = this.store.select(selectLoadingState, {
      date: this.date,
    });

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
      group: this.draggableTasksIdentifier,

      // reordering tasks accross dates
      onRemove: (event: any) => {
        if (event.to.id === 'unscheduled') {
          this.unscheduleTask(this.tasks[event.oldIndex]);
        } else {
          this.orderTaskOtherDate(
            this.tasks[event.oldIndex],
            event.to.id,
            event.newIndex
          );
        }
      },

      // intra date task reordering
      onUpdate: (event: any) =>
        this.orderTaskSameDate(event.oldIndex, event.newIndex),
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

  /** Add a new task with default values, a title and tags */
  addTask({ title, tags }: { title: string; tags: Array<string> }): void {
    // check whether this is the first task
    const previousId =
      this.tasks.length > 0 ? this.tasks[this.tasks.length - 1].id : null;

    this.store.dispatch(
      addTask({
        task: {
          title,
          previousId,
          date: this.date,
          details: null,
          complete: false,
          duration: null,
          tags,
        },
      })
    );
  }

  /** Move around tasks that belong to the same date */
  private orderTaskSameDate(oldIndex: number, newIndex: number): void {
    // when moving down assign the [newIndex].id, when moving up assing the [newIndex - 1].id
    const aboveId =
      oldIndex < newIndex
        ? this.tasks[newIndex].id
        : newIndex === 0
        ? null
        : this.tasks[newIndex - 1].id;

    this.orderTasks(
      this.tasks,
      this.tasks,
      this.tasks[oldIndex],
      aboveId,
      this.date
    );
  }

  private orderTaskOtherDate(
    movedTask: TaskDto,
    date: string,
    newPosition: number
  ) {
    // get the target date's sorted tasks
    this.store
      .pipe(
        select(selectTasksByDate, {
          date,
        }),
        first(),
        map(this.ts.sortTasks)
      )
      .subscribe((dropTasks) => {
        // pick the ID above the moved task
        const aboveId =
          dropTasks.length === 0 || newPosition === 0
            ? null
            : dropTasks[newPosition - 1].id;

        this.orderTasks(this.tasks, dropTasks, movedTask, aboveId, date);
      });
  }

  private orderTasks(
    dragTasks: ReadonlyArray<TaskDto>,
    dropTasks: ReadonlyArray<TaskDto>,
    movedTask: TaskDto,
    aboveId: number | null,
    dropDate: string
  ): void {
    // update the tasks to be reordered with an updated copy of the moved one
    const updatedTasks: Array<TaskDto> = [
      { ...movedTask, previousId: aboveId, date: dropDate },
    ];

    // change the task that references the one being changed
    const orphan = dragTasks.find((task) => task.previousId === movedTask.id);
    if (orphan) {
      updatedTasks.push({
        ...orphan,
        previousId: movedTask.previousId,
      });
    }

    // replace the task whose previous ID matches the new reference
    const pushedDown = dropTasks.find((task) => task.previousId === aboveId);
    if (pushedDown) {
      updatedTasks.push({
        ...pushedDown,
        previousId: movedTask.id,
      });
    }

    // dispatch the effect
    this.store.dispatch(
      updateTasks({
        tasks: updatedTasks,
      })
    );
  }

  private unscheduleTask(task: TaskDto): void {
    const tasks: Array<TaskDto> = [
      { ...task, previousId: null, date: null, duration: null },
    ];
    const orphan = this.tasks.find((t) => t.previousId === task.id);
    if (orphan) tasks.push({ ...orphan, previousId: task.previousId });
    this.store.dispatch(
      updateTasks({
        tasks,
      })
    );
  }

  get isToday(): boolean {
    return isToday(this.dateObject);
  }

  get dayName(): string {
    return format(this.dateObject, 'cccc');
  }

  get daySubtitle(): string {
    return format(this.dateObject, 'LLLL d');
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

  private moveTasks(tasks: ReadonlyArray<TaskDto>): void {
    this.store.dispatch(
      updateTasks({
        tasks,
      })
    );
  }

  private rescheduleIncompleteTasks(dayDifference: number): void {
    const nextDate = formatDate(addDays(this.dateObject, dayDifference));

    // change tasks positions within current date when needed
    const sortedTasks = this.ts.createSortedCompleteTasks(this.tasks);

    const final = new Array<TaskDto>();
    const incomplete = new Array<TaskDto>();
    for (const task of sortedTasks) {
      if (task.complete) final.push(task);
      else incomplete.push(task);
    }

    // move incomplete tasks at the bottom of the schedule date's list
    this.ts
      .createAppendedTasks(incomplete, nextDate)
      .subscribe((rescheduled) => {
        this.moveTasks([...final, ...rescheduled]);
      });
  }

  /** Move incomplete tasks to the next day */
  postponeIncompleteTasks(): void {
    this.rescheduleIncompleteTasks(1);
  }

  /** Move incomplete tasks to the previous day */
  anticipateIncompleteTasks(): void {
    this.rescheduleIncompleteTasks(-1);
  }

  /** Reorder tasks according to their completion status, then original order */
  reorderCompleteTasks(): void {
    this.store.dispatch(
      updateTasks({ tasks: this.ts.createSortedCompleteTasks(this.tasks) })
    );
  }

  colourise(value: number): string {
    return interpolateRgb('rgb(190, 50, 10)', 'rgb(60, 140, 40)')(value);
  }
}
