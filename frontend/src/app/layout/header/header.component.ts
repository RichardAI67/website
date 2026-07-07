import { Component } from '@angular/core';
import { Router } from '@angular/router';

declare const bootstrap: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  constructor(private router: Router) {}

  // Klappt das mobile Menu zu und navigiert danach erst.
  // So verrutscht der Sprung nicht waehrend das Menu noch zuklappt,
  // und es funktioniert auch von einer anderen Seite aus (z.B. /planung).
  navigateAndClose(event: Event, fragment: string): void {
    event.preventDefault();

    const goHome = () => {
      this.router.navigate(['/'], { fragment });
    };

    const menu = document.getElementById('siteNavCollapse');
    if (menu && menu.classList.contains('show')) {
      const collapse = bootstrap.Collapse.getOrCreateInstance(menu);
      menu.addEventListener('hidden.bs.collapse', goHome, { once: true });
      collapse.hide();
    } else {
      goHome();
    }
  }
}
