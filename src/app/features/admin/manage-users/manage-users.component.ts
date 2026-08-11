import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../models/user.model';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];
const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'customer', label: 'Customer' },
  { value: 'admin', label: 'Admin' },
];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'name_asc', label: 'Name A\u2192Z' },
  { value: 'name_desc', label: 'Name Z\u2192A' },
];

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [DatePipe, FormsModule, ReactiveFormsModule],
  templateUrl: './manage-users.component.html',
})
export class ManageUsersComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);
  private readonly searchSubject = new Subject<string>();

  readonly users = signal<User[]>([]);
  readonly loading = signal(true);
  readonly searchQuery = signal('');
  readonly roleFilter = signal('');
  readonly statusFilter = signal('');
  readonly sortBy = signal('newest');
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);
  readonly total = signal(0);
  readonly pageSize = 10;

  readonly selectedUsers = signal<Set<string>>(new Set());
  readonly showDeleteConfirm = signal<User | null>(null);
  readonly showSuspendDialog = signal<User | null>(null);
  readonly showProfileDrawer = signal<User | null>(null);
  readonly showQuickMenu = signal<string | null>(null);
  readonly showExportMenu = signal(false);
  readonly suspendDuration = signal('7');

  readonly showFormModal = signal(false);
  readonly editingUserId = signal<string | null>(null);

  readonly userForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    role: ['customer'],
    password: ['', [Validators.minLength(6)]],
    isActive: [true],
  });

  readonly statusOptions = STATUS_OPTIONS;
  readonly roleOptions = ROLE_OPTIONS;
  readonly sortOptions = SORT_OPTIONS;
  readonly suspendDurations = [
    { label: '1 Day', value: '1' },
    { label: '7 Days', value: '7' },
    { label: '30 Days', value: '30' },
    { label: 'Permanent', value: 'permanent' },
  ];

  private deleteTarget: User | null = null;

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadUsers();
    });
  }

  ngOnInit() { this.loadUsers(); }

  get pageNumbers() {
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
  }

  get pageEnd() {
    return Math.min(this.currentPage() * this.pageSize, this.total());
  }

  allSelected(): boolean {
    return this.users().length > 0 && this.selectedUsers().size === this.users().length;
  }

  get statsCards() {
    const all = this.users();
    const active = all.filter(u => u.isActive !== false).length;
    const inactive = all.filter(u => u.isActive === false).length;
    const admins = all.filter(u => u.role === 'admin').length;
    const newThisMonth = all.filter(u => {
      const d = new Date(u.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    return [
      { icon: 'people', label: 'Total Users', count: this.total(),
        bg: 'background: #EFF6FF;', iconColor: 'color: #3980F4;', trend: null },
      { icon: 'check_circle', label: 'Active', count: active + admins,
        bg: 'background: #ECFDF5;', iconColor: 'color: #10B981;', trend: null },
      { icon: 'cancel', label: 'Inactive', count: inactive,
        bg: 'background: #FEF2F2;', iconColor: 'color: #F87171;', trend: null },
      { icon: 'shield', label: 'Admins', count: admins,
        bg: 'background: #EFF6FF;', iconColor: 'color: #3980F4;', trend: null },
      { icon: 'person_add', label: 'New This Month', count: newThisMonth,
        bg: 'background: #F5F3FF;', iconColor: 'color: #8B5CF6;', trend: newThisMonth > 0 ? `+${newThisMonth} this month` : null },
    ];
  }

  get avatarColors(): string[] {
    return ['#005DAC', '#7C3AED', '#059669', '#DC2626', '#D97706', '#DB2777', '#0D9488', '#4F46E5'];
  }

  getAvatarColor(name: string): string {
    const colors = this.avatarColors;
    const index = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
    return `background: ${colors[index]};`;
  }

  getRelativeTime(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return '1 month ago';
    if (diffMonths < 12) return `${diffMonths} months ago`;
    const diffYears = Math.floor(diffMonths / 12);
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  }

  getLastLogin(user: User): string {
    return user.createdAt ? `${this.getRelativeTime(user.createdAt)}` : 'Never';
  }

  onSearch(query: string) {
    this.searchSubject.next(query);
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadUsers();
  }

  resetFilters() {
    this.searchQuery.set('');
    this.roleFilter.set('');
    this.statusFilter.set('');
    this.sortBy.set('newest');
    this.currentPage.set(1);
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    const query = this.searchQuery() || undefined;
    const role = this.roleFilter() || undefined;
    this.userService.getUsers(query, role, this.currentPage(), this.pageSize).subscribe({
      next: (res) => {
        this.users.set(res.users);
        this.totalPages.set(res.totalPages);
        this.total.set(res.total);
        this.loading.set(false);
        this.selectedUsers.set(new Set());
      },
      error: () => this.loading.set(false),
    });
  }

  goToPage(page: string | number) {
    page = typeof page === 'string' ? parseInt(page, 10) : page;
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadUsers();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleSelect(id: string) {
    const set = new Set(this.selectedUsers());
    if (set.has(id)) set.delete(id);
    else set.add(id);
    this.selectedUsers.set(set);
  }

  toggleSelectAll() {
    if (this.allSelected()) {
      this.selectedUsers.set(new Set());
    } else {
      this.selectedUsers.set(new Set(this.users().map(u => u._id)));
    }
  }

  deselectAll() {
    this.selectedUsers.set(new Set());
  }

  toggleQuickMenu(id: string) {
    this.showQuickMenu.set(this.showQuickMenu() === id ? null : id);
  }

  toggleActive(user: User, active: boolean) {
    this.userService.updateUser(user._id, { isActive: active } as Partial<User>).subscribe(() => this.loadUsers());
  }

  confirmDeleteUser(user: User) {
    this.showDeleteConfirm.set(user);
  }

  executeDelete() {
    const target = this.showDeleteConfirm();
    if (!target) return;
    this.userService.deleteUser(target._id).subscribe(() => {
      this.showDeleteConfirm.set(null);
      this.loadUsers();
    });
  }

  deleteSelected() {
    const ids = Array.from(this.selectedUsers());
    if (ids.length === 0) return;
    let completed = 0;
    ids.forEach(id => {
      this.userService.deleteUser(id).subscribe(() => {
        completed++;
        if (completed === ids.length) this.loadUsers();
      });
    });
    this.deselectAll();
  }

  bulkSuspend() {
    const ids = Array.from(this.selectedUsers());
    if (ids.length === 0) return;
    let completed = 0;
    ids.forEach(id => {
      this.userService.updateUser(id, { isActive: false } as Partial<User>).subscribe(() => {
        completed++;
        if (completed === ids.length) this.loadUsers();
      });
    });
    this.deselectAll();
  }

  bulkActivate() {
    const ids = Array.from(this.selectedUsers());
    if (ids.length === 0) return;
    let completed = 0;
    ids.forEach(id => {
      this.userService.updateUser(id, { isActive: true } as Partial<User>).subscribe(() => {
        completed++;
        if (completed === ids.length) this.loadUsers();
      });
    });
    this.deselectAll();
  }

  executeSuspend(user: User) {
    this.userService.updateUser(user._id, { isActive: false } as Partial<User>).subscribe(() => this.loadUsers());
  }

  openProfileDrawer(user: User) {
    this.showProfileDrawer.set(user);
  }

  openAddDialog() {
    this.editingUserId.set(null);
    this.userForm.reset({ name: '', email: '', phone: '', role: 'customer', password: '', isActive: true });
    this.userForm.get('password')?.enable();
    this.userForm.get('password')?.setValidators([Validators.minLength(6)]);
    this.showFormModal.set(true);
  }

  openEditDialog(user: User) {
    this.editingUserId.set(user._id);
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      isActive: user.isActive !== false,
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.setValue('');
    this.userForm.get('password')?.disable();
    this.showFormModal.set(true);
  }

  closeFormModal() {
    this.showFormModal.set(false);
    this.editingUserId.set(null);
  }

  onSubmit() {
    if (this.userForm.invalid) return;
    const val = this.userForm.value;
    const id = this.editingUserId();

    if (id) {
      const data: Partial<User> = {
        name: val.name!,
        email: val.email!,
        phone: val.phone || '',
        role: val.role as 'customer' | 'admin',
        isActive: val.isActive ?? true,
      };
      this.userService.updateUser(id, data).subscribe(() => {
        this.closeFormModal();
        this.loadUsers();
      });
    } else {
      const data = {
        name: val.name!,
        email: val.email!,
        password: val.password || 'changeme123',
        phone: val.phone || '',
        role: val.role || 'customer',
        isActive: val.isActive ?? true,
      };
      this.userService.createUser(data).subscribe(() => {
        this.closeFormModal();
        this.loadUsers();
      });
    }
  }
}
