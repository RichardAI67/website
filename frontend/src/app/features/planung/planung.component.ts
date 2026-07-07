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
import { downloadIcsFile } from './data/ics-export';
import { downloadBackup, parseBackupFile } from './data/backup';
import {
  alreadyNotifiedToday,
  markNotifiedToday,
  notificationPermission,
  notificationsSupported,
  requestNotificationPermission,
  showNotification,
} from './data/notifications';
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

  notificationsSupported = notificationsSupported();
  notificationsEnabled = false;
  importMessage = '';

  ngOnInit(): void {
    this.items = loadPlanItems();
    this.refresh();
    this.notificationsEnabled = notificationPermission() === 'granted';
    this.notifyIfDueToday();
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

  exportToCalendar(): void {
    downloadIcsFile(this.items);
  }

  exportBackup(): void {
    downloadBackup(this.items);
  }

  async importBackup(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const imported = parseBackupFile(text);

      const existingIds = new Set(this.items.map((i) => i.id));
      const newItems = imported.filter((i) => !existingIds.has(i.id));

      this.items = [...this.items, ...newItems];
      this.save();

      this.importMessage =
        newItems.length === imported.length
          ? `${newItems.length} Einträge wiederhergestellt.`
          : `${newItems.length} neue Einträge wiederhergestellt (${imported.length - newItems.length} waren schon vorhanden).`;
    } catch {
      this.importMessage = 'Diese Datei konnte nicht gelesen werden. Ist es eine RichardAI-Sicherungsdatei?';
    }

    input.value = '';
  }

  async enableNotifications(): Promise<void> {
    const result = await requestNotificationPermission();
    this.notificationsEnabled = result === 'granted';
    if (this.notificationsEnabled) {
      this.notifyIfDueToday();
    }
  }

  private notifyIfDueToday(): void {
    if (notificationPermission() !== 'granted') {
      return;
    }

    const today = toLocalDateStr(new Date());
    if (alreadyNotifiedToday(today)) {
      return;
    }

    const due = [...this.overdueItems, ...this.todayItems].filter((i) => !i.done);
    if (due.length === 0) {
      return;
    }

    showNotification(
      'RichardAI Planung',
      due.length === 1 ? `${due[0].title} steht heute an.` : `${due.length} Einträge stehen heute an oder sind überfällig.`,
    );
    markNotifiedToday(today);
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
