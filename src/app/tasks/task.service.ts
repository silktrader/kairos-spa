import { Injectable } from '@angular/core';
import { Task } from './models/task';
import { format } from 'date-fns';
import { HttpClient } from '@angular/common/http';
import { TaskDto } from './models/task.dto';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DeleteTaskDto } from './models/deleteTask.dto';
import { TagDto } from './models/tag.dto';
import { TasksErrorDialogComponent } from './components/tasks-error-dialog/tasks-error-dialog.component';
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

  getTasksBetweenDates(
    startDate: Date,
    endDate: Date
  ): Observable<ReadonlyArray<Task>> {
    return this.http
      .get<ReadonlyArray<TaskDto>>(this.tasksUrl, {
        params: {
          startDate: this.getDateString(startDate),
          endDate: this.getDateString(endDate),
        },
      })
      .pipe(map((taskDtos) => taskDtos.map(this.deserialise)));
  }

  /** Sort tasks according to their previous ID references */
  sortTasks(tasks: Array<Task>): ReadonlyArray<Task> {
    const unorderedTasks = new Set(tasks);
    const orderedTasks: Array<Task> = [];
    let lastTaskId: number | null = null;

    while (unorderedTasks.size > 0) {
      let foundTask: Task | undefined;
      for (const task of unorderedTasks) {
        if (task.previousId === lastTaskId) {
          orderedTasks.push(task);
          foundTask = task;
          lastTaskId = task.id;
          break;
        }
      }
      if (foundTask) {
        unorderedTasks.delete(foundTask);
      } else {
        console.error(
          'Could not reconstruct tasks order. Ordered tasks:',
          orderedTasks,
          'Unordered tasks:',
          tasks
        );
        return tasks; // avoid infinite loops in case of error
      } // tk
    }

    return orderedTasks;
  }

  addTask(taskDto: Omit<TaskDto, 'id'>): Observable<Task> {
    return this.http
      .post<TaskDto>(this.tasksUrl, taskDto)
      .pipe(map(this.deserialise));
  }

  // might create an adapter service or use class-transformer later tk
  private deserialise(taskDto: TaskDto): Task {
    return new Task(
      taskDto.id,
      taskDto.previousId,
      new Date(taskDto.date),
      taskDto.title,
      taskDto.details,
      taskDto.complete,
      taskDto.duration,
      taskDto.tags.sort((a, b) => a.localeCompare(b))
    );
  }

  /** Turn a Task into a TaskDto */
  serialise(task: Task): TaskDto {
    const { id, title, details, complete, duration, previousId, tags } = task;
    return {
      id,
      title,
      details,
      complete,
      duration,
      previousId,
      tags,
      date: format(task.date, 'yyyy-MM-dd'),
    };
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
            affectedTask: response.affectedTask
              ? this.deserialise(response.affectedTask)
              : null,
          };
        })
      );
  }

  updateTask(task: TaskDto): Observable<Task> {
    return this.http
      .put<TaskDto>(`${this.tasksUrl}/${task.id}`, task)
      .pipe(map(this.deserialise));
  }

  updateTasks(tasks: ReadonlyArray<TaskDto>): Observable<ReadonlyArray<Task>> {
    return this.http
      .put<ReadonlyArray<TaskDto>>(this.tasksUrl, tasks)
      .pipe(map((tasksDtos) => tasksDtos.map(this.deserialise)));
  }

  haveDifferentValues(task: Task, dto: TaskDto): boolean {
    // compare basic values in order of most likely to be different
    if (task.title !== dto.title) return true;
    if (task.complete !== dto.complete) return true;
    if (task.duration !== dto.duration) return true;
    if (task.details !== dto.details) return true;

    // compare formatted dates
    if (this.getDateString(task.date) !== dto.date) return true;

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

  getTimers(): Observable<ReadonlyArray<TaskTimer>> {
    return this.http.get<ReadonlyArray<TaskTimer>>(`${this.tasksUrl}/timers`);
  }

  addTimer(taskTimer: TaskTimer): Observable<TaskTimer> {
    return this.http.post<TaskTimer>(
      `${this.tasksUrl}/${taskTimer.taskId}/timer`,
      { timestamp: parseInt(taskTimer.timestamp) }
    );
  }

  stopTimer(taskId: number) {
    return this.http.delete(`${this.tasksUrl}/${taskId}/timer`);
  }
}
