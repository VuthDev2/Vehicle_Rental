import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="p-6 bg-background min-h-screen pb-16">
      <div class="mb-6">
        <p class="text-xs font-bold uppercase tracking-widest text-outline">Users</p>
        <h1 class="text-2xl font-bold text-on-surface">Manage Customers</h1>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-outline-variant/30 bg-surface-container-low">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-outline-variant/30 bg-surface-container-high text-xs font-bold uppercase tracking-wider text-outline">
              <th class="p-4">Customer</th>
              <th class="p-4">Contact Info</th>
              <th class="p-4">Role</th>
              <th class="p-4">Registered Date</th>
              <th class="p-4">Status</th>
              <th class="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/20 text-sm">
            @if (loading()) {
              <tr>
                <td colspan="6" class="p-8 text-center text-on-surface-variant animate-pulse">Loading customers...</td>
              </tr>
            } @else if (users().length === 0) {
              <tr>
                <td colspan="6" class="p-8 text-center text-on-surface-variant">No customers found.</td>
              </tr>
            } @else {
              @for (user of users(); track user._id) {
                <tr class="hover:bg-surface-container-high/50 transition-colors">
                  <td class="p-4">
                    <div class="flex items-center gap-3">
                      <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">
                        {{ user.name.charAt(0).toUpperCase() }}
                      </div>
                      <p class="font-bold text-on-surface">{{ user.name }}</p>
                    </div>
                  </td>
                  <td class="p-4">
                    <p class="font-semibold text-on-surface">{{ user.email }}</p>
                    <p class="text-xs text-on-surface-variant">{{ user.phone || 'No phone number' }}</p>
                  </td>
                  <td class="p-4 font-semibold uppercase text-xs text-outline">{{ user.role }}</td>
                  <td class="p-4 text-on-surface-variant">{{ user.createdAt | date }}</td>
                  <td class="p-4">
                    <span [class]="user.isActive !== false ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'"
                      class="rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
                      {{ user.isActive !== false ? 'Active' : 'Disabled' }}
                    </span>
                  </td>
                  <td class="p-4 text-right">
                    <div class="flex justify-end gap-2">
                      @if (user.isActive !== false) {
                        <button (click)="toggleActive(user, false)" class="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/30">
                          Disable
                        </button>
                      } @else {
                        <button (click)="toggleActive(user, true)" class="rounded-lg bg-green-500/20 px-3 py-1.5 text-xs font-bold text-green-400 hover:bg-green-500/30">
                          Enable
                        </button>
                      }
                      <button (click)="deleteUser(user._id)" class="rounded-lg bg-surface-container-high px-3 py-1.5 text-xs font-bold text-on-surface hover:bg-surface-container-highest">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ManageUsersComponent implements OnInit {
  private readonly userService = inject(UserService);

  readonly users = signal<User[]>([]);
  readonly loading = signal(true);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.userService.getUsers().subscribe({
      next: (res) => {
        this.users.set(res.users);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleActive(user: User, active: boolean) {
    this.userService.updateUser(user._id, { isActive: active }).subscribe(() => this.loadUsers());
  }

  deleteUser(id: string) {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.userService.deleteUser(id).subscribe(() => this.loadUsers());
    }
  }
}
