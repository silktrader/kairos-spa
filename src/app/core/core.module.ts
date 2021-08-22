import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from '../material/material.module';
import { GeneralErrorDialogComponent } from './components/general-error-dialog/general-error-dialog.component';
import { GeneralErrorHandler } from './general-error-handler';
import { KeyboardShortcutsModule } from 'ng-keyboard-shortcuts';
import { SortablejsModule } from 'ngx-sortablejs';
import { AuthModule } from '../auth/auth.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [GeneralErrorDialogComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    BrowserAnimationsModule,
    AuthModule.forRoot({ backendUrl: 'http://localhost:8080/auth/' }),
    SortablejsModule.forRoot({ animation: 150 }),
    KeyboardShortcutsModule.forRoot(),
  ],
  exports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    BrowserAnimationsModule,
    AuthModule,
    SortablejsModule,
    KeyboardShortcutsModule,
  ],
  entryComponents: [GeneralErrorDialogComponent],
  providers: [{ provide: ErrorHandler, useClass: GeneralErrorHandler }],
})
export class CoreModule {}
