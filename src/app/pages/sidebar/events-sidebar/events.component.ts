import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import {
  selectHabitEvents,
  selectTaskEvents,
  selectTasksByDay,
} from 'src/app/store/schedule.selectors';
import { BehaviorSubject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { formatDistanceToNow } from 'date-fns';
import {
  deleteTask,
  updateTask,
  addTask,
} from 'src/app/store/schedule.actions';
import { AppState } from 'src/app/store/app-state';
import { AppEvent } from 'src/app/store/task-event.interface';
import { TaskDto } from 'src/app/models/dtos/task.dto';
import { EventOperation } from 'src/app/store/task-event-operation.enum';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit {
  visibleEvents$ = new BehaviorSubject<EventsView>('tasks');

  habitsEvents$ = this.store.pipe(select(selectHabitEvents));
  taskEvents$ = this.store.pipe(select(selectTaskEvents));

  referenceNow: Date;

  eventsSwitcher = new FormControl('tasks');

  eventOperation = EventOperation;

  constructor(private readonly store: Store<AppState>) {}

  ngOnInit(): void {
    this.eventsSwitcher.valueChanges.subscribe((value) => {
      // update the reference date without needing to create one new instance for each event
      this.referenceNow = new Date();
      this.visibleEvents$.next(value);
    });
  }

  timeAgo(taskEvent: AppEvent): string {
    return formatDistanceToNow(taskEvent.timestamp);
  }

  delete(id: number): void {
    this.store.dispatch(deleteTask({ deletedTaskId: id }));
  }

  revertTask(currentDto: TaskDto, restoredDto: TaskDto): void {
    this.store.dispatch(
      updateTask({ originalTask: currentDto, updatedTask: restoredDto })
    );
  }

  restoreTask(taskDto: TaskDto): void {
    // get the last id in the date's task list
    // we assume that to delete a task its ancestors were fetched, displayed and in the store
    this.store
      .pipe(select(selectTasksByDay, { date: taskDto.date }), first())
      .subscribe((orderedTasks) => {
        this.store.dispatch(
          addTask({
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
    }
  }
}

export type EventsView = 'tasks' | 'habits';
