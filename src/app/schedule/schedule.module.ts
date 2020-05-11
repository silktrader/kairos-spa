import { NgModule } from '@angular/core';
import { ScheduleColumnComponent } from './schedule-column/schedule-column.component';
import { CoreModule } from '../core/core.module';
import { TasksModule } from '../tasks/tasks.module';
import { ScheduleComponent } from './schedule/schedule.component';
import { EventsSidebarComponent } from './events-sidebar/events-sidebar.component';
import { HabitsSidebarComponent } from './habits-sidebar/habits-sidebar.component';
import { TagsSidebarComponent } from './tags-sidebar/tags-sidebar.component';
import { UnscheduledSidebarComponent } from './unscheduled-sidebar/unscheduled-sidebar.component';
import { SidebarSectionTitleComponent } from './sidebar-section-title/sidebar-section-title.component';
import { HabitsModule } from '../habits/habits.module';

@NgModule({
  declarations: [
    ScheduleComponent,
    ScheduleColumnComponent,
    SidebarSectionTitleComponent,
    EventsSidebarComponent,
    HabitsSidebarComponent,
    TagsSidebarComponent,
    UnscheduledSidebarComponent,
  ],
  imports: [CoreModule, TasksModule, HabitsModule],
  exports: [ScheduleComponent],
})
export class ScheduleModule {}
