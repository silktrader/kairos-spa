import { Component, OnInit, Input } from '@angular/core';
import { ScheduleState } from 'src/app/store/app-state';
import { Store } from '@ngrx/store';
import { toggleSidebar } from 'src/app/store/schedule.actions';

@Component({
  selector: 'app-sidebar-section-title',
  templateUrl: './sidebar-section-title.component.html',
  styleUrls: ['./sidebar-section-title.component.scss'],
})
export class SidebarSectionTitleComponent implements OnInit {
  @Input() title: string;

  constructor(private readonly store: Store<ScheduleState>) {}

  ngOnInit(): void {}

  closeSidebar(): void {
    this.store.dispatch(toggleSidebar({ opened: false }));
  }
}
