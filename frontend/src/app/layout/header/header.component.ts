import { Component } from '@angular/core';

declare const bootstrap: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  // Klappt das mobile Menu zu und springt danach erst zum Ziel-Anker.
  // So verrutscht der Sprung nicht waehrend das Menu noch zuklappt.
  closeMenu(event: Event): void {
    const link = event.currentTarget as HTMLAnchorElement;
    const targetId = link.getAttribute('href');

    const jumpToTarget = () => {
      if (targetId) {
        document.querySelector(targetId)?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    const menu = document.getElementById('siteNavCollapse');
    if (menu && menu.classList.contains('show')) {
      event.preventDefault();
      const collapse = bootstrap.Collapse.getOrCreateInstance(menu);
      menu.addEventListener('hidden.bs.collapse', jumpToTarget, { once: true });
      collapse.hide();
    }
  }
}
