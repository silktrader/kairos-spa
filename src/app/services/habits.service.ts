import { Injectable } from '@angular/core';
import { HabitDto } from '../models/dtos/habit-dto';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HabitsService {
  private readonly habitsUrl = `${environment.backendRootURL}/habits`;

  constructor(private readonly http: HttpClient) {}

  addHabit(habitDto: Omit<HabitDto, 'id'>): Observable<HabitDto> {
    return this.http.post<HabitDto>(this.habitsUrl, habitDto);
  }

  getHabits(): Observable<ReadonlyArray<HabitDto>> {
    return this.http.get<ReadonlyArray<HabitDto>>(this.habitsUrl);
  }
}
