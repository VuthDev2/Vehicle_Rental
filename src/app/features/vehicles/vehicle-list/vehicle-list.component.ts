import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-vehicle-list',
  imports: [FormsModule, RouterLink, MatButtonModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <section class="page">
      <div class="section-head">
        <div>
          <p class="eyebrow">Catalog</p>
          <h1>Find the right vehicle</h1>
        </div>
      </div>

      <form class="filter-bar">
        <mat-form-field appearance="outline"><mat-label>Search</mat-label><input matInput [ngModel]="query()" (ngModelChange)="query.set($event)" name="query"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Location</mat-label><mat-select [ngModel]="location()" (ngModelChange)="location.set($event)" name="location"><mat-option value="">All</mat-option>@for (item of locations(); track item) { <mat-option [value]="item">{{ item }}</mat-option> }</mat-select></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Type</mat-label><mat-select [ngModel]="type()" (ngModelChange)="type.set($event)" name="type"><mat-option value="">All</mat-option>@for (item of types(); track item) { <mat-option [value]="item">{{ item }}</mat-option> }</mat-select></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Transmission</mat-label><mat-select [ngModel]="transmission()" (ngModelChange)="transmission.set($event)" name="transmission"><mat-option value="">All</mat-option><mat-option value="Automatic">Automatic</mat-option><mat-option value="Manual">Manual</mat-option></mat-select></mat-form-field>
      </form>

      <div class="vehicle-grid">
        @for (vehicle of vehicles(); track vehicle._id) {
          <article class="vehicle-card">
            <img [src]="vehicle.images[0]" [alt]="vehicle.name">
            <div class="card-body">
              <div class="split"><h2>{{ vehicle.name }}</h2><strong>\${{ vehicle.price }}/day</strong></div>
              <p>{{ vehicle.location }} · {{ vehicle.year }} · {{ vehicle.seats }} seats</p>
              <mat-chip-set><mat-chip>{{ vehicle.type }}</mat-chip><mat-chip>{{ vehicle.fuel }}</mat-chip><mat-chip>{{ vehicle.transmission }}</mat-chip></mat-chip-set>
              <div class="actions"><a mat-flat-button [routerLink]="['/vehicles', vehicle._id]">View details</a><span class="status" [class.muted]="!vehicle.available">{{ vehicle.available ? 'Available' : 'Booked' }}</span></div>
            </div>
          </article>
        }
      </div>
    </section>
  `,
})
export class VehicleListComponent {
  private readonly data = inject(DataService);
  readonly query = signal('');
  readonly location = signal('');
  readonly type = signal('');
  readonly transmission = signal('');
  readonly locations = computed(() => [...new Set(this.data.vehicles().map((vehicle) => vehicle.location))]);
  readonly types = computed(() => [...new Set(this.data.vehicles().map((vehicle) => vehicle.type))]);
  readonly vehicles = computed(() => this.data.filterVehicles({ query: this.query(), location: this.location(), type: this.type(), transmission: this.transmission(), maxPrice: 0 }));
}
