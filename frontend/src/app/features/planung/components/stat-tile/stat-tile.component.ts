import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-stat-tile',
  templateUrl: './stat-tile.component.html',
  styleUrl: './stat-tile.component.scss',
})
export class StatTileComponent implements OnChanges {
  @Input() value = 0;
  @Input() label = '';
  @Input() tone: 'normal' | 'warning' = 'normal';

  displayValue = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.animateTo(changes['value'].currentValue as number);
    }
  }

  private animateTo(target: number): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.displayValue = target;
      return;
    }

    const start = this.displayValue;
    const diff = target - start;
    if (diff === 0) {
      return;
    }

    const duration = 500;
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.displayValue = Math.round(start + diff * eased);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }
}
