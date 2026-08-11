import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PromotionService } from '../../../core/services/promotion.service';
import { Promotion } from '../../../models/promotion.model';

@Component({
  selector: 'app-manage-promotions',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, DatePipe],
  templateUrl: './manage-promotions.component.html',
})
export class ManagePromotionsComponent implements OnInit {
  private readonly promotionService = inject(PromotionService);
  private readonly fb = inject(FormBuilder);

  readonly Math = Math;

  readonly promotions = signal<Promotion[]>([]);
  readonly loading = signal(true);
  readonly showModal = signal(false);
  readonly selectedPromo = signal<Promotion | null>(null);

  readonly searchQuery = signal('');
  readonly statusFilter = signal('all');
  readonly typeFilter = signal('all');
  readonly sortBy = signal('newest');
  readonly currentPage = signal(1);
  readonly pageSize = 9;

  readonly form = this.fb.group({
    code: ['', Validators.required],
    description: [''],
    discountType: ['percent', Validators.required],
    value: [10, [Validators.required, Validators.min(0)]],
    minAmount: [0, [Validators.required, Validators.min(0)]],
    maxUses: [null as number | null],
    expiresAt: [''],
  });

  // Derived stats
  readonly activeCount = computed(() =>
    this.promotions().filter(p => p.active && !this.isExpired(p)).length
  );
  readonly expiredCount = computed(() =>
    this.promotions().filter(p => this.isExpired(p)).length
  );
  readonly disabledCount = computed(() =>
    this.promotions().filter(p => !p.active && !this.isExpired(p)).length
  );
  readonly totalRedemptions = computed(() =>
    this.promotions().reduce((sum, p) => sum + p.usedCount, 0)
  );

  // Filtering
  readonly filteredPromotions = computed(() => {
    let list = [...this.promotions()];

    const query = this.searchQuery().toLowerCase();
    if (query) {
      list = list.filter(
        p => p.code.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query)
      );
    }

    const status = this.statusFilter();
    if (status === 'active') list = list.filter(p => p.active && !this.isExpired(p));
    else if (status === 'expired') list = list.filter(p => this.isExpired(p));
    else if (status === 'disabled') list = list.filter(p => !p.active && !this.isExpired(p));

    const type = this.typeFilter();
    if (type !== 'all') list = list.filter(p => p.discountType === type);

    const sort = this.sortBy();
    if (sort === 'newest') list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sort === 'oldest') list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    else if (sort === 'code') list.sort((a, b) => a.code.localeCompare(b.code));
    else if (sort === 'uses') list.sort((a, b) => b.usedCount - a.usedCount);

    return list;
  });

  // Pagination
  readonly totalPages = computed(() => Math.ceil(this.filteredPromotions().length / this.pageSize));

  readonly paginatedPromotions = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredPromotions().slice(start, start + this.pageSize);
  });

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const start = Math.max(1, current - 1);
    const end = Math.min(total, start + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  ngOnInit() {
    this.loadPromotions();
  }

  loadPromotions() {
    this.loading.set(true);
    this.promotionService.getPromotions().subscribe({
      next: (res) => {
        this.promotions.set(res.promotions);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openAddModal() {
    this.form.reset({
      code: '',
      description: '',
      discountType: 'percent',
      value: 10,
      minAmount: 0,
      maxUses: null,
      expiresAt: '',
    });
    this.showModal.set(true);
  }

  onSubmit() {
    if (this.form.invalid) return;
    const val = this.form.value;
    const data: Partial<Promotion> = {
      code: val.code!.toUpperCase(),
      description: val.description || '',
      discountType: val.discountType as any,
      value: val.value!,
      minAmount: val.minAmount!,
      maxUses: val.maxUses || null,
      expiresAt: val.expiresAt || null,
      active: true,
    };

    this.promotionService.createPromotion(data).subscribe(() => {
      this.showModal.set(false);
      this.loadPromotions();
    });
  }

  toggleActive(promo: Promotion) {
    this.promotionService.updatePromotion(promo._id, { active: !promo.active }).subscribe(() => this.loadPromotions());
  }

  deletePromo(id: string) {
    if (confirm('Are you sure you want to delete this promotion?')) {
      this.promotionService.deletePromotion(id).subscribe(() => this.loadPromotions());
    }
  }

  openDetailDrawer(promo: Promotion) {
    this.selectedPromo.set(promo);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  clearFilters() {
    this.searchQuery.set('');
    this.statusFilter.set('all');
    this.typeFilter.set('all');
    this.currentPage.set(1);
  }

  isExpired(promo: Promotion): boolean {
    if (!promo.expiresAt) return false;
    return new Date(promo.expiresAt) < new Date();
  }

  getStatus(promo: Promotion): 'active' | 'expired' | 'disabled' {
    if (this.isExpired(promo)) return 'expired';
    if (promo.active) return 'active';
    return 'disabled';
  }

  getStatusLabel(promo: Promotion): string {
    if (this.isExpired(promo)) return 'Expired';
    if (promo.active) return 'Active';
    return 'Disabled';
  }
}
