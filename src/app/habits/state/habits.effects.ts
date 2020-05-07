import { Injectable } from '@angular/core';
import { createEffect, ofType, Actions } from '@ngrx/effects';
import { mergeMap, map, tap, catchError } from 'rxjs/operators';
import { HabitDto } from '../models/habit.dto';
import { EMPTY } from 'rxjs';
import { HabitEntryDto } from '../models/habit-entry.dto';
import { HabitsService } from '../habits.service';
import { MatDialog } from '@angular/material/dialog';
import {
  addHabit,
  addHabitSuccess,
  editHabit,
  editHabitSuccess,
  deleteHabit,
  deleteHabitSuccess,
  getHabits,
  getHabitsSuccess,
  getHabitsEntries,
  getHabitsEntriesSuccess,
  addHabitEntry,
  addHabitEntrySuccess,
  deleteHabitEntry,
  deleteHabitEntrySuccess,
} from './habits.actions';

@Injectable()
export class HabitsEffects {
  addHabit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addHabit),
      mergeMap((action: { habit: Omit<HabitDto, 'id'> }) =>
        this.hs
          .addHabit(action.habit)
          .pipe(map((habit) => addHabitSuccess({ habit })))
      )
    )
  );

  editHabit = createEffect(() =>
    this.actions$.pipe(
      ofType(editHabit),
      mergeMap((action: { habit: HabitDto }) =>
        this.hs
          .editHabit(action.habit)
          .pipe(map((habit) => editHabitSuccess({ habit })))
      )
    )
  );

  deleteHabit = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteHabit),
      mergeMap((action: { habit: HabitDto }) =>
        this.hs
          .deleteHabit(action.habit)
          .pipe(map(() => deleteHabitSuccess({ habit: action.habit })))
      )
    )
  );

  habitOperationsSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(deleteHabitSuccess, editHabitSuccess, addHabitSuccess),
        tap(() => this.matDialog.closeAll())
      ),
    { dispatch: false }
  );

  getHabits$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getHabits),
      mergeMap(() =>
        this.hs.getHabits().pipe(
          map((habits) => getHabitsSuccess({ habits })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  getHabitsEntries$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getHabitsEntries),
      mergeMap((action: { dates: ReadonlyArray<string> }) =>
        this.hs
          .getHabitsEntries(action.dates)
          .pipe(
            map((habitsEntries) => getHabitsEntriesSuccess({ habitsEntries }))
          )
      )
    )
  );

  setHabitEntry$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addHabitEntry),
      mergeMap((action: { habitEntry: Omit<HabitEntryDto, 'id'> }) =>
        this.hs
          .addHabitEntry(action.habitEntry)
          .pipe(map((habitEntry) => addHabitEntrySuccess({ habitEntry })))
      )
    )
  );

  deleteHabitEntry$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteHabitEntry),
      mergeMap((action: { habitEntry: HabitEntryDto }) =>
        this.hs.deleteHabitEntry(action.habitEntry).pipe(
          map(() =>
            deleteHabitEntrySuccess({
              habitEntry: action.habitEntry,
            })
          )
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private hs: HabitsService,
    private matDialog: MatDialog
  ) {}
}
