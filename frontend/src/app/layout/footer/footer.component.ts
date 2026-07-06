import { Component } from '@angular/core';
import { CATEGORIES } from '../../features/landing/data/categories';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  year = new Date().getFullYear();
  categories = CATEGORIES;
}
