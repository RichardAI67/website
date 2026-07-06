import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { Category } from '../../data/categories';

@Component({
  selector: 'app-category-card',
  templateUrl: './category-card.component.html',
  styleUrl: './category-card.component.scss',
})
export class CategoryCardComponent {
  @Input() category!: Category;

  // 3D-Kipp-Effekt beim Hover
  rotateX = 0;
  rotateY = 0;
  hovering = false;

  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    this.rotateY = (x - 0.5) * 14;
    this.rotateX = (0.5 - y) * 14;
    this.hovering = true;
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.rotateX = 0;
    this.rotateY = 0;
    this.hovering = false;
  }

  cardTransform(): string {
    const lift = this.hovering ? 'translateY(-4px) translateZ(10px)' : '';
    return `perspective(800px) rotateX(${this.rotateX}deg) rotateY(${this.rotateY}deg) ${lift}`;
  }
}
