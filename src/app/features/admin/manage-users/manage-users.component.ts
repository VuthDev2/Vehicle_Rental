import { Component, inject } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-manage-users',
  imports: [MatChipsModule],
  template: `
    <section class="page">
      <div class="section-head"><div><p class="eyebrow">Users</p><h1>Manage users</h1></div></div>
      <div class="table-list">
        @for (user of data.users(); track user._id) {
          <article><div><h2>{{ user.name }}</h2><p>{{ user.email }} · {{ user.phone }}</p></div><mat-chip-set><mat-chip>{{ user.role }}</mat-chip></mat-chip-set><span>{{ user.createdAt }}</span></article>
        }
      </div>
    </section>
  `,
})
export class ManageUsersComponent {
  readonly data = inject(DataService);
}
