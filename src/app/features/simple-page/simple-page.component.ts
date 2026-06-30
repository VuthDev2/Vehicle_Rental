import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-simple-page',
  template: `
    <section class="page narrow">
      <p class="eyebrow">RentFlow</p>
      <h1>{{ route.snapshot.data['title'] }}</h1>
      <p class="lede">{{ route.snapshot.data['body'] }}</p>
    </section>
  `,
})
export class SimplePageComponent {
  readonly route = inject(ActivatedRoute);
}
