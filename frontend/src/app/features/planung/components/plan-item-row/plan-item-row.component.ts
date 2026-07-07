import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlanItem, Recurrence } from '../../data/plan-item';
import { DatePipe} from '@angular/common'

@Component({
  selector: 'app-plan-item-row',
  imports: [DatePipe],
  templateUrl: './plan-item-row.component.html',
  styleUrl: './plan-item-row.component.scss',
})
export class PlanItemRowComponent {
  @Input() item!: PlanItem;
  @Input() countdown = '';
  @Output() toggleDone = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();

  recurrenceLabel(recurrence?: Recurrence): string {
    switch (recurrence) {
      case 'taeglich':
        return 'täglich';
      case 'woechentlich':
        return 'wöchentlich';
      case 'monatlich':
        return 'monatlich';
      case 'jaehrlich':
        return 'jährlich';
      default:
        return '';
    }
  }
}
