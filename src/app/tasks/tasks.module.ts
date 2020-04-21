import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core/core.module';
import { MaterialModule } from '../material/material.module';
import { StoreModule } from '@ngrx/store';
import { TasksEffects } from './state/tasks.effects';
import { EffectsModule } from '@ngrx/effects';
import { tasksReducer } from './state/tasks.reducer';
import { EditTaskDialogComponent } from './components/edit-task-dialog/edit-task-dialog.component';

@NgModule({
  declarations: [EditTaskDialogComponent],
  imports: [
    CommonModule,
    CoreModule,
    MaterialModule,
    StoreModule.forFeature('tasks', tasksReducer),
    EffectsModule.forFeature([TasksEffects]),
  ],
  entryComponents: [EditTaskDialogComponent],
})
export class TasksModule {}
