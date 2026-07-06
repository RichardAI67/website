import { Component } from '@angular/core';
import { HeroComponent } from './components/hero/hero.component';
import { CategoryGridComponent } from './components/category-grid/category-grid.component';
import { TrustSectionComponent } from './components/trust-section/trust-section.component';
import { CtaBannerComponent } from './components/cta-banner/cta-banner.component';

@Component({
  selector: 'app-landing',
  imports: [HeroComponent, CategoryGridComponent, TrustSectionComponent, CtaBannerComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {}
