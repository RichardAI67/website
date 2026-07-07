import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  PlanItem,
  PlanItemType,
  Recurrence,
  compareByDateAndTime,
  countdownLabel,
  loadPlanItems,
  savePlanItems,
  toLocalDateStr,
} from './data/plan-item';
import { PlanItemRowComponent } from './components/plan-item-row/plan-item-row.component';
import { PlanCalendarComponent } from './components/plan-calendar/plan-calendar.component';
import { StatTileComponent } from './components/stat-tile/stat-tile.component';

type ViewMode = 'liste' | 'kalender';

@Component({
  selector: 'app-planung',
  imports: [FormsModule, RouterLink, PlanItemRowComponent, PlanCalendarComponent, StatTileComponent],
  templateUrl: './planung.component.html',
  styleUrl: './planung.component.scss',
})
export class PlanungComponent implements OnInit {
  items: PlanItem[] = [];
  view: ViewMode = 'liste';

  newTitle = '';
  newType: PlanItemType = 'termin';
  newDate = '';
  newTime = '';
  newRecurrence: Recurrence = 'monatlich';

  // Vorberechnete Gruppen statt Getter, damit bei jedem Change-Detection-Durchlauf
  // nicht mehrfach neu gefiltert wird - wird nur nach echten Aenderungen neu berechnet.
  overdueItems: PlanItem[] = [];
  todayItems: PlanItem[] = [];
  weekItems: PlanItem[] = [];
  laterItems: PlanItem[] = [];

  overdueCount = 0;
  todayCount = 0;
  weekCount = 0;
  doneCount = 0;

  ngOnInit(): void {
    this.items = loadPlanItems();
    this.refresh();
  }

  setView(view: ViewMode): void {
    this.view = view;
  }

  addItem(): void {
    if (!this.newTitle.trim() || !this.newDate) {
      return;
    }

    const item: PlanItem = {
      id: crypto.randomUUID(),
      title: this.newTitle.trim(),
      type: this.newType,
      date: this.newDate,
      done: false,
    };
    if (this.newTime) {
      item.time = this.newTime;
    }
    if (this.newType === 'aufgabe') {
      item.recurrence = this.newRecurrence;
    }

    this.items = [...this.items, item];
    this.save();

    this.newTitle = '';
    this.newDate = '';
    this.newTime = '';
    this.newType = 'termin';
  }

  toggleDone(item: PlanItem): void {
    item.done = !item.done;
    this.save();
  }

  removeItem(item: PlanItem): void {
    this.items = this.items.filter((i) => i.id !== item.id);
    this.save();
  }

  countdown(item: PlanItem): string {
    return countdownLabel(item);
  }

  private save(): void {
    savePlanItems(this.items);
    this.refresh();
  }

  private refresh(): void {
    const today = toLocalDateStr(new Date());
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() + 7);
    const limit = toLocalDateStr(limitDate);

    this.overdueItems = this.items.filter((i) => i.date < today).sort(compareByDateAndTime);
    this.todayItems = this.items.filter((i) => i.date === today).sort(compareByDateAndTime);
    this.weekItems = this.items.filter((i) => i.date > today && i.date <= limit).sort(compareByDateAndTime);
    this.laterItems = this.items.filter((i) => i.date > limit).sort(compareByDateAndTime);

    this.overdueCount = this.overdueItems.length;
    this.todayCount = this.todayItems.length;
    this.weekCount = this.todayItems.length + this.weekItems.length;
    this.doneCount = this.items.filter((i) => i.done).length;
  }
}
