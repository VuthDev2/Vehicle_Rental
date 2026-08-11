import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-simple-page',
  templateUrl: './simple-page.component.html',
})
export class SimplePageComponent {
  readonly route = inject(ActivatedRoute);
}
