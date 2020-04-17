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
import { environment } from '../environments/environment'; // Angular CLI environment
import { AuthModule } from 'auth';
import { AuthComponent } from './pages/auth/auth.component';
import { SigninComponent } from './pages/auth/signin/signin.component';
import { SortablejsModule } from 'ngx-sortablejs';
import { EditTaskDialogComponent } from './pages/edit-task-dialog/edit-task-dialog.component';
import { EffectsModule } from '@ngrx/effects';
import { ScheduleEffects } from './store/schedule.effects';
import { EventsComponent } from './pages/sidebar/events-sidebar/events.component';
import { HabitsSidebarComponent } from './pages/sidebar/habits-sidebar/habits-sidebar.component';
import { SidebarSectionTitleComponent } from './pages/sidebar/sidebar-section-title/sidebar-section-title.component';
import { HabitsModule } from './habits/habits.module';
import { CoreModule } from './core/core.module';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DayViewComponent,
    AuthComponent,
    SigninComponent,
    EditTaskDialogComponent,
    EventsComponent,
    HabitsSidebarComponent,
    SidebarSectionTitleComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    StoreModule.forRoot({ schedule: Reducers.taskReducer }),
    StoreDevtoolsModule.instrument({
      maxAge: 10,
      logOnly: environment.production,
    }),
    BrowserAnimationsModule,
    MaterialModule,
    AuthModule.forRoot({ backendUrl: 'http://localhost:3000/auth/' }),
    SortablejsModule.forRoot({ animation: 150 }),
    EffectsModule.forRoot([ScheduleEffects]),
    HabitsModule,
  ],
  entryComponents: [EditTaskDialogComponent],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
