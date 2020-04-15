import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { DayService } from '../services/day.service';
import * as ScheduleActions from './schedule.actions';
import { mergeMap, map, catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { TaskDto } from '../models/dtos/task.dto';
import { HabitDto } from '../models/dtos/habit.dto';
import { HabitsService } from '../services/habits.service';
import { HabitEntryDto } from '../models/dtos/habit-entry.dto';

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

  addHabit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ScheduleActions.addHabit),
      mergeMap((action: { habit: Omit<HabitDto, 'id'> }) =>
        this.hs
          .addHabit(action.habit)
          .pipe(map((habit) => ScheduleActions.addHabitSuccess({ habit })))
      )
    )
  );

  updateHabit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ScheduleActions.editHabit),
      mergeMap((action: { habit: HabitDto }) =>
        this.hs
          .editHabit(action.habit)
          .pipe(map((habit) => ScheduleActions.editHabitSuccess({ habit })))
      )
    )
  );

  getHabits$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ScheduleActions.getHabits),
      mergeMap(() =>
        this.hs.getHabits().pipe(
          map((habits) => ScheduleActions.getHabitsSuccess({ habits })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  getHabitsEntries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ScheduleActions.getHabitsEntries),
      mergeMap((action: { startDate: Date; endDate: Date }) =>
        this.hs
          .getHabitsEntries(action.startDate, action.endDate)
          .pipe(
            map((habitsEntries) =>
              ScheduleActions.getHabitsEntriesSuccess({ habitsEntries })
            )
          )
      )
    )
  );

  setHabitEntry$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ScheduleActions.addHabitEntry),
      mergeMap((action: { habitEntry: Omit<HabitEntryDto, 'id'> }) =>
        this.hs
          .addHabitEntry(action.habitEntry)
          .pipe(
            map((habitEntry) =>
              ScheduleActions.addHabitEntrySuccess({ habitEntry })
            )
          )
      )
    )
  );

  deleteHabitEntry$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ScheduleActions.deleteHabitEntry),
      mergeMap((action: { habitEntry: HabitEntryDto }) =>
        this.hs.deleteHabitEntry(action.habitEntry).pipe(
          map(() =>
            ScheduleActions.deleteHabitEntrySuccess({
              habitEntry: action.habitEntry,
            })
          )
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private ds: DayService,
    private hs: HabitsService
  ) {}
}
