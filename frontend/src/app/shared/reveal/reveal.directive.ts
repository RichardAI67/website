import { Directive, ElementRef, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';

// Blendet ein Element sanft ein, sobald es beim Scrollen ins Bild kommt.
// Wird auf mehreren Sektionen der Startseite benutzt, damit die Seite die
// gleiche Bewegung hat wie der Hero oben.
@Directive({
  selector: '[appReveal]',
})
export class RevealDirective implements OnInit, OnDestroy {
  @Input() revealDelay = 0;

  @HostBinding('class.revealed') revealed = false;

  private observer?: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.el.nativeElement.style.transitionDelay = `${this.revealDelay}ms`;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.revealed = true;
      return;
    }

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.revealed = true;
          this.observer?.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
