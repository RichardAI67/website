import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { PlanItem, countdownLabel, toLocalDateStr } from '../../data/plan-item';
import { PlanItemRowComponent } from '../plan-item-row/plan-item-row.component';

interface CalendarDay {
  date: string;
  dayNumber: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  items: PlanItem[];
}

@Component({
  selector: 'app-plan-calendar',
  imports: [PlanItemRowComponent],
  templateUrl: './plan-calendar.component.html',
  styleUrl: './plan-calendar.component.scss',
})
export class PlanCalendarComponent implements OnChanges {
  @Input() items: PlanItem[] = [];
  @Output() toggleDone = new EventEmitter<PlanItem>();
  @Output() remove = new EventEmitter<PlanItem>();

  weekdayLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  viewYear = new Date().getFullYear();
  viewMonth = new Date().getMonth();
  selectedDate = toLocalDateStr(new Date());

  days: CalendarDay[] = [];

  ngOnChanges(): void {
    this.buildGrid();
  }

  get monthLabel(): string {
    const formatter = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' });
    return formatter.format(new Date(this.viewYear, this.viewMonth, 1));
  }

  get selectedItems(): PlanItem[] {
    return this.items
      .filter((i) => i.date === this.selectedDate)
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  previousMonth(): void {
    this.viewMonth -= 1;
    if (this.viewMonth < 0) {
      this.viewMonth = 11;
      this.viewYear -= 1;
    }
    this.buildGrid();
  }

  nextMonth(): void {
    this.viewMonth += 1;
    if (this.viewMonth > 11) {
      this.viewMonth = 0;
      this.viewYear += 1;
    }
    this.buildGrid();
  }

  selectDay(day: CalendarDay): void {
    this.selectedDate = day.date;
  }

  countdown(item: PlanItem): string {
    return countdownLabel(item);
  }

  private buildGrid(): void {
    const firstOfMonth = new Date(this.viewYear, this.viewMonth, 1);
    // Montag = 0 ... Sonntag = 6, statt JS-Standard (Sonntag = 0)
    const firstWeekday = (firstOfMonth.getDay() + 6) % 7;

    const gridStart = new Date(this.viewYear, this.viewMonth, 1 - firstWeekday);
    const totalCells = 42; // 6 Wochen, damit das Raster immer gleich hoch bleibt

    const todayStr = toLocalDateStr(new Date());
    const days: CalendarDay[] = [];

    for (let i = 0; i < totalCells; i++) {
      const cellDate = new Date(gridStart);
      cellDate.setDate(gridStart.getDate() + i);
      const dateStr = toLocalDateStr(cellDate);

      days.push({
        date: dateStr,
        dayNumber: cellDate.getDate(),
        inCurrentMonth: cellDate.getMonth() === this.viewMonth,
        isToday: dateStr === todayStr,
        items: this.items.filter((item) => item.date === dateStr),
      });
    }

    this.days = days;
  }
}
