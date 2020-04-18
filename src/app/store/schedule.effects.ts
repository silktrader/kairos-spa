import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { DayService } from '../services/day.service';
import * as ScheduleActions from './schedule.actions';
import { mergeMap, map, catchError, tap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { TaskDto } from '../models/dtos/task.dto';
import { HabitsService } from '../habits/habits.service';
import { MatDialog } from '@angular/material/dialog';
import { AppEvent, AddTaskEvent, EditTaskEvent } from './app-event.interface';

@Injectable()
export class ScheduleEffects {
  getTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ScheduleActions.getDatesTasks),
      mergeMap((action: { startDate: Date; endDate: Date }) =>
        this.ds.getTasksBetweenDates(action.startDate, action.endDate).pipe(
          map((tasks) => ScheduleActions.getDatesTasksSuccess({ tasks })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  addTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ScheduleActions.addTask),
      mergeMap((action: { task: Omit<TaskDto, 'id'> }) =>
        this.ds
          .addTask(action.task)
          .pipe(map((task) => ScheduleActions.addTaskSuccess({ task })))
      )
    )
  );

  updateTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ScheduleActions.updateTask),
      mergeMap((action: { originalTask: TaskDto; updatedTask: TaskDto }) =>
        this.ds.updateTask(action.updatedTask).pipe(
          map((task) =>
            ScheduleActions.updateTaskSuccess({
              originalTask: action.originalTask,
              updatedTask: task,
            })
          )
        )
      )
    )
  );

  updateTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ScheduleActions.updateTasks),
      mergeMap((action: { tasksDtos: ReadonlyArray<TaskDto> }) =>
        this.ds
          .updateTasks(action.tasksDtos)
          .pipe(map((tasks) => ScheduleActions.updateTasksSuccess({ tasks })))
      )
    )
  );

  deleteTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ScheduleActions.deleteTask),
      mergeMap((action: { deletedTaskId: number }) =>
        this.ds.deleteTask(action.deletedTaskId).pipe(
          map((response) =>
            ScheduleActions.deleteTaskSuccess({
              deletedTaskId: response.deletedTaskId,
              affectedTask: response.affectedTask,
            })
          )
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private ds: DayService,
    private hs: HabitsService,
    private matDialog: MatDialog
  ) {}
}
