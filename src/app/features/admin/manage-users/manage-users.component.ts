import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div style="background: #FBF9F9; min-height: 100%; padding: 24px;">

      <!-- ==================== HEADER ==================== -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <h1 style="font-size: 28px; font-weight: 700; color: #1B1C1C; margin: 0;">Customers</h1>
          <span style="background: #E5EEFF; color: #005DAC; padding: 2px 14px; border-radius: 20px; font-size: 14px; font-weight: 600; line-height: 28px;">
            {{ total() }} registered
          </span>
        </div>
        <div class="flex items-center gap-3">
          <div style="position: relative;">
            <span class="material-symbols-outlined" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 20px; color: #76777D; pointer-events: none;">search</span>
            <input type="text" placeholder="Search customers..."
                   [value]="searchQuery()" (input)="searchQuery.set($any($event.target).value); loadUsers()"
                   style="width: 240px; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px 10px 40px; font-size: 14px; color: #1B1C1C; outline: none; background: #FFFFFF; box-sizing: border-box;"
                   onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'" />
          </div>
          <select [value]="roleFilter()" (change)="roleFilter.set($any($event.target).value); currentPage.set(1); loadUsers()"
                  style="border: 1px solid #E9E8E7; border-radius: 8px; background: #FFFFFF; padding: 10px 32px 10px 16px; font-size: 14px; color: #1B1C1C; cursor: pointer; outline: none;">
            <option value="">All Roles</option>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <!-- ==================== TABLE ==================== -->
      @if (loading()) {
        <div style="background: #FFFFFF; border: 1px solid #E9E8E7; border-radius: 12px; overflow: hidden;">
          @for (i of [1,2,3,4]; track i) {
            <div style="padding: 16px 24px; border-bottom: 1px solid #F0EFEF; display: flex; gap: 16px; align-items: center;">
              <div class="skeleton" style="width: 36px; height: 36px; border-radius: 50%;"></div>
              <div style="flex: 2;"><div class="skeleton" style="height: 14px; width: 60%;"></div></div>
              <div style="flex: 2;"><div class="skeleton" style="height: 14px; width: 50%;"></div></div>
              <div style="flex: 1;"><div class="skeleton" style="height: 14px; width: 40%;"></div></div>
              <div style="flex: 1;"><div class="skeleton" style="height: 14px; width: 30%;"></div></div>
            </div>
          }
        </div>
      } @else if (users().length === 0) {
        <div style="background: #FFFFFF; border: 1px solid #E9E8E7; border-radius: 12px; text-align: center; padding: 80px 20px;">
          <span class="material-symbols-outlined" style="font-size: 48px; color: #C1C6D4; margin-bottom: 12px;">person_off</span>
          <p style="font-size: 18px; font-weight: 600; color: #717783; margin: 0 0 4px;">No customers found</p>
          <p style="font-size: 14px; color: #76777D; margin: 0;">{{ searchQuery() ? 'Try a different search.' : 'Customers will appear once they register.' }}</p>
        </div>
      } @else {
        <div style="background: #FFFFFF; border: 1px solid #E9E8E7; border-radius: 12px; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #F5F3F3;">
                <th style="padding: 12px 24px; text-align: left; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Customer</th>
                <th style="padding: 12px 24px; text-align: left; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Contact</th>
                <th style="padding: 12px 24px; text-align: left; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Role</th>
                <th style="padding: 12px 24px; text-align: left; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Registered</th>
                <th style="padding: 12px 24px; text-align: center; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Status</th>
                <th style="padding: 12px 24px; text-align: right; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (user of users(); track user._id) {
                <tr style="border-bottom: 1px solid #F0EFEF;">
                  <td style="padding: 16px 24px;">
                    <div class="flex items-center gap-3">
                      <div style="width: 36px; height: 36px; border-radius: 50%; background: #FD761A; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #FFFFFF; flex-shrink: 0;">
                        {{ user.name.charAt(0).toUpperCase() }}
                      </div>
                      <span style="font-size: 14px; font-weight: 600; color: #1B1C1C;">{{ user.name }}</span>
                    </div>
                  </td>
                  <td style="padding: 16px 24px;">
                    <p style="font-size: 14px; color: #1B1C1C; margin: 0;">{{ user.email }}</p>
                    <p style="font-size: 12px; color: #717783; margin: 0;">{{ user.phone || 'No phone' }}</p>
                  </td>
                  <td style="padding: 16px 24px;">
                    <span style="display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
                      background: {{ user.role === 'admin' ? '#D4E3FF' : '#F5F3F3' }}; color: {{ user.role === 'admin' ? '#005DAC' : '#717783' }};">
                      {{ user.role }}
                    </span>
                  </td>
                  <td style="padding: 16px 24px;">
                    <span style="font-size: 13px; color: #717783;">{{ user.createdAt | date }}</span>
                  </td>
                  <td style="padding: 16px 24px; text-align: center;">
                    <span style="display: inline-block; padding: 3px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.3px;
                      background: {{ user.isActive !== false ? '#E7F5ED' : '#FFDAD6' }}; color: {{ user.isActive !== false ? '#1E7B4C' : '#B3261E' }};">
                      {{ user.isActive !== false ? 'Active' : 'Disabled' }}
                    </span>
                  </td>
                  <td style="padding: 16px 24px; text-align: right;">
                    <div class="flex items-center justify-end gap-2">
                      @if (user.isActive !== false) {
                        <button (click)="toggleActive(user, false)"
                                style="background: #FFDAD6; color: #B3261E; border: none; border-radius: 6px; padding: 6px 12px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: background 0.15s;"
                                onmouseover="this.style.background='#F5C2C0'" onmouseout="this.style.background='#FFDAD6'">
                          Disable
                        </button>
                      } @else {
                        <button (click)="toggleActive(user, true)"
                                style="background: #E7F5ED; color: #1E7B4C; border: none; border-radius: 6px; padding: 6px 12px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: background 0.15s;"
                                onmouseover="this.style.background='#D0ECD8'" onmouseout="this.style.background='#E7F5ED'">
                          Enable
                        </button>
                      }
                      <button (click)="deleteUser(user._id)"
                              style="background: none; border: none; cursor: pointer; color: #717783; padding: 6px; transition: color 0.15s;"
                              onmouseover="this.style.color='#B3261E'" onmouseout="this.style.color='#717783'">
                        <span class="material-symbols-outlined" style="font-size: 20px;">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- ==================== PAGINATION ==================== -->
        @if (totalPages() > 0) {
          <div style="border-top: 1px solid #E9E8E7; padding-top: 20px; margin-top: 20px; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 14px; color: #717783;">
              {{ (currentPage() - 1) * pageSize + 1 }}–{{ Math.min(currentPage() * pageSize, total()) }} of {{ total() }}
            </span>
            <div class="flex items-center gap-1">
              <button (click)="goToPage(currentPage() - 1)" [disabled]="currentPage() <= 1"
                      style="width: 36px; height: 36px; border: 1px solid #E9E8E7; border-radius: 8px; background: #FFFFFF; display: flex; align-items: center; justify-content: center; color: {{ currentPage() <= 1 ? '#C1C6D4' : '#414752' }}; cursor: {{ currentPage() <= 1 ? 'not-allowed' : 'pointer' }};">
                <span class="material-symbols-outlined" style="font-size: 16px;">chevron_left</span>
              </button>
              @for (p of pageNumbers(); track p) {
                @if (p === '...') {
                  <span style="padding: 0 4px; color: #C1C6D4; font-size: 14px;">...</span>
                } @else {
                  <button (click)="goToPage(p)"
                          style="width: 36px; height: 36px; border: none; border-radius: 8px; background: {{ currentPage() === p ? '#005DAC' : 'transparent' }}; color: {{ currentPage() === p ? '#FFFFFF' : '#414752' }}; font-size: 14px; font-weight: {{ currentPage() === p ? '700' : '500' }}; cursor: pointer;">
                    {{ p }}
                  </button>
                }
              }
              <button (click)="goToPage(currentPage() + 1)" [disabled]="currentPage() >= totalPages()"
                      style="width: 36px; height: 36px; border: 1px solid #E9E8E7; border-radius: 8px; background: #FFFFFF; display: flex; align-items: center; justify-content: center; color: {{ currentPage() >= totalPages() ? '#C1C6D4' : '#414752' }}; cursor: {{ currentPage() >= totalPages() ? 'not-allowed' : 'pointer' }};">
                <span class="material-symbols-outlined" style="font-size: 16px;">chevron_right</span>
              </button>
            </div>
          </div>
        }
      }

      <!-- ==================== FOOTER ==================== -->
      <div style="border-top: 1px solid #E9E8E7; margin-top: 32px; padding-top: 20px; display: flex; justify-content: space-between; font-size: 13px; color: #717783;">
        <span>&copy; 2025 Vehicle Rental. All rights reserved.</span>
        <div class="flex items-center gap-4">
          <a href="#" style="color: #717783; text-decoration: none;">Privacy Policy</a>
          <a href="#" style="color: #717783; text-decoration: none;">Terms of Service</a>
          <a href="#" style="color: #717783; text-decoration: none;">Support</a>
        </div>
      </div>

    </div>
  `,
})
export class ManageUsersComponent implements OnInit {
  protected readonly Math = Math;

  private readonly userService = inject(UserService);

  readonly users = signal<User[]>([]);
  readonly loading = signal(true);
  readonly searchQuery = signal('');
  readonly roleFilter = signal('');
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly total = signal(0);
  readonly pageSize = 20;

  ngOnInit() { this.loadUsers(); }

  readonly pageNumbers = () => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (current > 3) pages.push('...');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
  };

  loadUsers() {
    this.loading.set(true);
    this.userService.getUsers(
      this.searchQuery() || undefined,
      this.roleFilter() || undefined,
      this.currentPage(),
      this.pageSize
    ).subscribe({
      next: (res) => {
        this.users.set(res.users);
        this.totalPages.set(res.totalPages);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadUsers();
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
