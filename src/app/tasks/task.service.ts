import { Injectable } from '@angular/core';
import { format } from 'date-fns';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TaskDto } from './models/task.dto';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DeleteTaskDto } from './models/deleteTask.dto';
import { TagDto } from './models/tag.dto';
import { TaskTimer } from './models/task-timer.dto';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly tasksUrl = `${environment.backendRootURL}/tasks`;
  private readonly tagsUrl = `${environment.backendRootURL}/tags`;

  constructor(private readonly http: HttpClient) {}

  getDateString(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  getTasksFromDates(dates: Array<string>): Observable<ReadonlyArray<TaskDto>> {
    return this.http.get<ReadonlyArray<TaskDto>>(this.tasksUrl, {
      params: {
        dates,
      },
    });
  }

  getDateTasks(date: string): Observable<ReadonlyArray<TaskDto>> {
    return this.http.get<ReadonlyArray<TaskDto>>(
      `${this.tasksUrl}/date/${date}`
    );
  }

  /** Sort tasks according to their previous ID references */
  sortTasks(tasks: Array<TaskDto>): ReadonlyArray<TaskDto> {
    const unorderedTasks = new Set(tasks);
    const orderedTasks: Array<TaskDto> = [];
    let lastTaskId: number | null = null;

    while (unorderedTasks.size > 0) {
      let foundTask: TaskDto | undefined;
      for (const task of unorderedTasks) {
        if (task.previousId === lastTaskId) {
          orderedTasks.push(task);
          foundTask = task;
          lastTaskId = task.id;
          break;
        }
      }

      if (foundTask) unorderedTasks.delete(foundTask);
      else throw new Error();
    }

    return orderedTasks;
  }

  addTask(taskDto: Omit<TaskDto, 'id'>): Observable<TaskDto> {
    return this.http.post<TaskDto>(this.tasksUrl, taskDto);
  }

  deleteTask(taskId: number): Observable<DeleteTaskDto> {
    return this.http
      .delete<{ deletedTaskId: number; affectedTask: TaskDto | null }>(
        `${this.tasksUrl}/${taskId}`
      )
      .pipe(
        map((response) => {
          return {
            deletedTaskId: response.deletedTaskId,
            affectedTask: response.affectedTask ? response.affectedTask : null,
          };
        })
      );
  }

  updateTask(task: TaskDto): Observable<TaskDto> {
    return this.http.put<TaskDto>(`${this.tasksUrl}/${task.id}`, task);
  }

  updateTasks(
    tasks: ReadonlyArray<TaskDto>
  ): Observable<ReadonlyArray<TaskDto>> {
    return this.http.put<ReadonlyArray<TaskDto>>(this.tasksUrl, tasks);
  }

  // tk better implementation?
  haveDifferentValues(task: TaskDto, dto: TaskDto): boolean {
    // compare basic values in order of most likely to be different
    if (task.title !== dto.title) return true;
    if (task.complete !== dto.complete) return true;
    if (task.duration !== dto.duration) return true;
    if (task.details !== dto.details) return true;

    // compare formatted dates
    if (task.date !== dto.date) return true;

    // determine whether the tags are the same
    if (task.tags.length !== dto.tags.length) return true;
    for (let i = 0; i < task.tags.length; i++) {
      if (task.tags[i] !== dto.tags[i]) return true;
    }

    return false;
  }

  getTags(): Observable<ReadonlyArray<TagDto>> {
    return this.http.get<ReadonlyArray<TagDto>>(this.tagsUrl);
  }

  addTag(tagDto: Omit<TagDto, 'id'>): Observable<TagDto> {
    return this.http.post<TagDto>(this.tagsUrl, tagDto);
  }

  editTag(tagDto: TagDto): Observable<TagDto> {
    return this.http.put<TagDto>(`${this.tagsUrl}/${tagDto.id}`, tagDto);
  }

  deleteTag(tagDto: TagDto): Observable<void> {
    return this.http.delete<void>(`${this.tagsUrl}/${tagDto.id}`);
  }

  getTimers(): Observable<ReadonlyArray<TaskTimer>> {
    return this.http.get<ReadonlyArray<TaskTimer>>(`${this.tasksUrl}/timers`);
  }

  addTimer(taskTimer: TaskTimer): Observable<TaskTimer> {
    return this.http.post<TaskTimer>(
      `${this.tasksUrl}/${taskTimer.taskId}/timer`,
      { timestamp: parseInt(taskTimer.timestamp, 10) }
    );
  }

  stopTimer(taskId: number) {
    return this.http.delete(`${this.tasksUrl}/${taskId}/timer`);
  }
}
