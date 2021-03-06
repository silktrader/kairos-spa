import { Injectable } from '@angular/core';
import { HabitDto } from './models/habit.dto';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { HabitEntryDto } from './models/habit-entry.dto';
import { map } from 'rxjs/operators';
import { formatISO } from 'date-fns';

@Injectable({
  providedIn: 'root',
})
export class HabitsService {
  private readonly habitsUrl = `${environment.backendRootURL}/habits`;
  private readonly habitsEntriesUrl = this.habitsUrl + '/entries';

  constructor(private readonly http: HttpClient) {}

  addHabit(habitDto: Omit<HabitDto, 'id'>): Observable<HabitDto> {
    return this.http.post<HabitDto>(this.habitsUrl, habitDto);
  }

  editHabit(habitDto: HabitDto): Observable<HabitDto> {
    return this.http.put<HabitDto>(
      `${this.habitsUrl}/${habitDto.id}`,
      habitDto
    );
  }

  deleteHabit(habitDto: HabitDto): Observable<HabitDto> {
    return this.http.delete<HabitDto>(`${this.habitsUrl}/${habitDto.id}`);
  }

  getHabits(): Observable<ReadonlyArray<HabitDto>> {
    return this.http.get<ReadonlyArray<HabitDto>>(this.habitsUrl);
  }

  getHabitsEntries(
    dates: ReadonlyArray<string>
  ): Observable<ReadonlyArray<HabitEntryDto>> {
    return this.http.get<ReadonlyArray<HabitEntryDto>>(this.habitsEntriesUrl, {
      params: {
        dates: dates as Array<string>,
      },
    });
  }

  addHabitEntry(
    habitEntryDto: Omit<HabitEntryDto, 'id'>
  ): Observable<HabitEntryDto> {
    return this.http.post<HabitEntryDto>(this.habitsEntriesUrl, habitEntryDto);
  }

  deleteHabitEntry(habitEntryDto: HabitEntryDto): Observable<boolean> {
    return this.http.delete<boolean>(
      `${this.habitsEntriesUrl}/${habitEntryDto.date}/${habitEntryDto.habitId}`
    );
  }
}
