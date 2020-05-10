import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from '../material/material.module';
import { GeneralErrorDialogComponent } from './components/general-error-dialog/general-error-dialog.component';
import { GeneralErrorHandler } from './general-error-handler';
import { KeyboardShortcutsModule } from 'ng-keyboard-shortcuts';
import { SortablejsModule } from 'ngx-sortablejs';

@NgModule({
  declarations: [GeneralErrorDialogComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SortablejsModule.forRoot({ animation: 150 }),
    KeyboardShortcutsModule.forRoot(),
  ],
  exports: [
    CommonModule,
    MaterialModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    SortablejsModule,
    KeyboardShortcutsModule,
  ],
  entryComponents: [GeneralErrorDialogComponent],
  providers: [{ provide: ErrorHandler, useClass: GeneralErrorHandler }],
})
export class CoreModule {}
