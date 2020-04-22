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

@NgModule({
  declarations: [
    EditTaskDialogComponent,
    SidebarSectionTitleComponent,
    TagsSidebarComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    MaterialModule,
    StoreModule.forFeature('tasks', tasksReducer),
    EffectsModule.forFeature([TasksEffects]),
  ],
  exports: [SidebarSectionTitleComponent, TagsSidebarComponent],
  entryComponents: [EditTaskDialogComponent],
})
export class TasksModule {}
