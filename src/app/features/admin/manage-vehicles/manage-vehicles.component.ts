import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-manage-vehicles',
  imports: [MatButtonModule, MatChipsModule],
  template: `
    <section class="page">
      <div class="section-head"><div><p class="eyebrow">Fleet</p><h1>Manage vehicles</h1></div><button mat-flat-button type="button">Add vehicle</button></div>
      <div class="table-list">
        @for (vehicle of data.vehicles(); track vehicle._id) {
          <article>
            <img class="thumb" [src]="vehicle.images[0]" [alt]="vehicle.name">
            <div><h2>{{ vehicle.name }}</h2><p>{{ vehicle.brand }} {{ vehicle.model }} · {{ vehicle.location }} · \${{ vehicle.price }}/day</p></div>
            <mat-chip-set><mat-chip>{{ vehicle.available ? 'Available' : 'Booked' }}</mat-chip></mat-chip-set>
            <button mat-stroked-button type="button">Edit</button>
          </article>
        }
      </div>
    </section>
  `,
})
export class ManageVehiclesComponent {
  readonly data = inject(DataService);
}
