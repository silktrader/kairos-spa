import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import * as Reducers from './store/schedule.reducers';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { HomeComponent } from './pages/home/home.component';
import { DayViewComponent } from './pages/day-view/day-view.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../environments/environment'; // Angular CLI environment
import { AuthModule } from 'auth';
import { HttpClientModule } from '@angular/common/http';
import { AuthComponent } from './pages/auth/auth.component';
import { SigninComponent } from './pages/auth/signin/signin.component';
import { SortablejsModule } from 'ngx-sortablejs';
import { EditTaskDialogComponent } from './pages/edit-task-dialog/edit-task-dialog.component';
import { EffectsModule } from '@ngrx/effects';
import { ScheduleEffects } from './store/schedule.effects';
import { EventsComponent } from './pages/sidebar/events-sidebar/events.component';
import { AddHabitDialogComponent } from './pages/add-habit-dialog/add-habit-dialog.component';
import { HabitsSidebarComponent } from './pages/sidebar/habits-sidebar/habits-sidebar.component';
import { SidebarSectionTitleComponent } from './pages/sidebar/sidebar-section-title/sidebar-section-title.component';
import { EditHabitDialogComponent } from './dialogs/edit-habit-dialog/edit-habit-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DayViewComponent,
    AuthComponent,
    SigninComponent,
    EditTaskDialogComponent,
    EventsComponent,
    AddHabitDialogComponent,
    HabitsSidebarComponent,
    SidebarSectionTitleComponent,
    EditHabitDialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot({ schedule: Reducers.taskReducer }),
    StoreDevtoolsModule.instrument({
      maxAge: 10,
      logOnly: environment.production,
    }),
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    AuthModule.forRoot({ backendUrl: 'http://localhost:3000/auth/' }),
    SortablejsModule.forRoot({ animation: 150 }),
    EffectsModule.forRoot([ScheduleEffects]),
  ],
  entryComponents: [
    EditTaskDialogComponent,
    AddHabitDialogComponent,
    EditHabitDialogComponent,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
