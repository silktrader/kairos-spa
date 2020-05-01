import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core/core.module';
import { MaterialModule } from '../material/material.module';
import { StoreModule } from '@ngrx/store';
import { TasksEffects } from './state/tasks.effects';
import { EffectsModule } from '@ngrx/effects';
import { tasksReducer } from './state/tasks.reducer';
import { EditTaskDialogComponent } from './components/edit-task-dialog/edit-task-dialog.component';
import { TagsSidebarComponent } from './components/tags-sidebar/tags-sidebar.component';
import { SidebarSectionTitleComponent } from '../core/components/sidebar-section-title/sidebar-section-title.component';
import { EditTagDialogComponent } from './components/edit-tag-dialog/edit-tag-dialog.component';
import { TasksErrorDialogComponent } from './components/tasks-error-dialog/tasks-error-dialog.component';

@NgModule({
  declarations: [
    EditTaskDialogComponent,
    SidebarSectionTitleComponent,
    TagsSidebarComponent,
    EditTagDialogComponent,
    TasksErrorDialogComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    MaterialModule,
    StoreModule.forFeature('tasks', tasksReducer),
    EffectsModule.forFeature([TasksEffects]),
  ],
  exports: [SidebarSectionTitleComponent, TagsSidebarComponent],
  entryComponents: [
    EditTaskDialogComponent,
    EditTagDialogComponent,
    TasksErrorDialogComponent,
  ],
})
export class TasksModule {}
