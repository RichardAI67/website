import { Component } from '@angular/core';
import { RevealDirective } from '../../../../shared/reveal/reveal.directive';

@Component({
  selector: 'app-cta-banner',
  imports: [RevealDirective],
  templateUrl: './cta-banner.component.html',
  styleUrl: './cta-banner.component.scss',
})
export class CtaBannerComponent {}
