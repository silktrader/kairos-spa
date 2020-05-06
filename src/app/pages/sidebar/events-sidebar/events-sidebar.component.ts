import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { formatDistanceToNow } from 'date-fns';
import { AppState } from 'src/app/store/app-state';
import { AppEvent, TaskEvent } from 'src/app/store/app-event.state';
import { TaskDto } from 'src/app/tasks/models/task.dto';
import { EventOperation } from 'src/app/store/event-operation.enum';
import { first, map, takeUntil } from 'rxjs/operators';
import { selectHabitsEvents } from 'src/app/habits/state/habits.selectors';
import {
  selectTaskEvents,
  selectTasksByDate,
} from 'src/app/tasks/state/tasks.selectors';
import { remove, add, edit } from 'src/app/tasks/state/tasks.actions';
import { TaskService } from 'src/app/tasks/task.service';

@Component({
  selector: 'app-events',
  templateUrl: './events-sidebar.component.html',
  styleUrls: ['./events-sidebar.component.scss'],
})
export class EventsSidebarComponent implements OnInit, OnDestroy {
  visibleEvents$ = new BehaviorSubject<EventsView>('tasks');

  habitsEvents$ = this.store.select(selectHabitsEvents);
  taskEvents$ = this.store
    .select(selectTaskEvents)
    .pipe(
      map((events) => events.filter((event) => event instanceof TaskEvent))
    ) as Observable<Array<TaskEvent>>;

  referenceNow: Date;

  eventsSwitcher = new FormControl('tasks');

  private readonly ngUnsubscribe$ = new Subject();

  eventOperation = EventOperation;

  constructor(
    private readonly store: Store<AppState>,
    private ts: TaskService
  ) {}

  ngOnInit(): void {
    this.eventsSwitcher.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((value) => {
        // update the reference date without needing to create one new instance for each event
        this.referenceNow = new Date();
        this.visibleEvents$.next(value);
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  timeAgo(taskEvent: AppEvent): string {
    return formatDistanceToNow(taskEvent.timestamp);
  }

  delete(id: number): void {
    this.store.dispatch(remove({ removedTaskId: id }));
  }

  revertTask(currentDto: TaskDto, restoredDto: TaskDto): void {
    this.store.dispatch(
      edit({ originalTask: currentDto, updatedTask: restoredDto })
    );
  }

  restoreTask(taskDto: TaskDto): void {
    // get the last id in the date's task list
    // we assume that to delete a task its ancestors were fetched, displayed and in the store
    this.store
      .pipe(
        select(selectTasksByDate, { date: taskDto.date }),
        map(this.ts.sortTasks),
        first()
      )
      .subscribe((orderedTasks) => {
        this.store.dispatch(
          add({
            task: {
              ...taskDto,
              previousId: orderedTasks[orderedTasks.length - 1].id,
            },
          })
        );
      });
  }

  operationName(operation: EventOperation): string {
    switch (operation) {
      case EventOperation.AddedTask:
      case EventOperation.AddedHabit:
        return 'added';
      case EventOperation.DeletedTask:
      case EventOperation.DeletedHabit:
        return 'deleted';
      case EventOperation.EditedTask:
      case EventOperation.EditedHabit:
        return 'edited';
      default:
        return '';
    }
  }
}

export type EventsView = 'tasks' | 'habits';
