import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PromotionService } from '../../../core/services/promotion.service';
import { Promotion } from '../../../models/promotion.model';

@Component({
  selector: 'app-manage-promotions',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  template: `
    <div class="p-6 bg-background min-h-screen pb-16">
      <div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-outline">Marketing</p>
          <h1 class="text-2xl font-bold text-on-surface">Manage Promotions</h1>
        </div>
        <button (click)="openAddModal()" class="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/20 hover:brightness-110">
          Add Promotion
        </button>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-outline-variant/30 bg-surface-container-low">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-outline-variant/30 bg-surface-container-high text-xs font-bold uppercase tracking-wider text-outline">
              <th class="p-4">Code</th>
              <th class="p-4">Discount</th>
              <th class="p-4">Min Spend</th>
              <th class="p-4">Usage</th>
              <th class="p-4">Expiry</th>
              <th class="p-4">Status</th>
              <th class="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/20 text-sm">
            @if (loading()) {
              <tr>
                <td colspan="7" class="p-8 text-center text-on-surface-variant animate-pulse">Loading promotions...</td>
              </tr>
            } @else if (promotions().length === 0) {
              <tr>
                <td colspan="7" class="p-8 text-center text-on-surface-variant">No promotions created yet.</td>
              </tr>
            } @else {
              @for (promo of promotions(); track promo._id) {
                <tr class="hover:bg-surface-container-high/50 transition-colors">
                  <td class="p-4">
                    <p class="font-bold text-primary">{{ promo.code }}</p>
                    <p class="text-xs text-on-surface-variant">{{ promo.description || 'No description' }}</p>
                  </td>
                  <td class="p-4 font-semibold text-on-surface">
                    {{ promo.discountType === 'percent' ? promo.value + '%' : '$' + promo.value }}
                  </td>
                  <td class="p-4 font-semibold text-on-surface">\${{ promo.minAmount }}</td>
                  <td class="p-4 font-semibold text-on-surface">
                    {{ promo.usedCount }} / {{ promo.maxUses || 'Unlimited' }}
                  </td>
                  <td class="p-4 text-on-surface-variant">
                    {{ promo.expiresAt ? (promo.expiresAt | date) : 'Never' }}
                  </td>
                  <td class="p-4">
                    <span [class]="promo.active ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'"
                      class="rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider">
                      {{ promo.active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="p-4 text-right">
                    <div class="flex justify-end gap-2">
                      <button (click)="toggleActive(promo)" class="rounded-lg bg-surface-container-high px-3 py-1.5 text-xs font-bold text-on-surface hover:bg-surface-container-highest">
                        {{ promo.active ? 'Disable' : 'Enable' }}
                      </button>
                      <button (click)="deletePromo(promo._id)" class="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/30">
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

      <!-- Add Promotion Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div class="w-full max-w-md rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 shadow-2xl">
            <h2 class="mb-4 text-xl font-bold text-on-surface">Add New Promotion</h2>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
              <div>
                <label class="mb-1 block text-sm font-semibold text-on-surface">Promo Code</label>
                <input type="text" formControlName="code" class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high px-3 py-2.5 text-on-surface uppercase focus:outline-none" placeholder="e.g. CAMBO10" />
              </div>

              <div>
                <label class="mb-1 block text-sm font-semibold text-on-surface">Description</label>
                <input type="text" formControlName="description" class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high px-3 py-2.5 text-on-surface focus:outline-none" />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="mb-1 block text-sm font-semibold text-on-surface">Discount Type</label>
                  <select formControlName="discountType" class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high px-3 py-2.5 text-on-surface focus:outline-none">
                    <option value="percent">Percent (%)</option>
                    <option value="fixed">Fixed ($)</option>
                  </select>
                </div>
                <div>
                  <label class="mb-1 block text-sm font-semibold text-on-surface">Value</label>
                  <input type="number" formControlName="value" class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high px-3 py-2.5 text-on-surface focus:outline-none" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="mb-1 block text-sm font-semibold text-on-surface">Min Spend ($)</label>
                  <input type="number" formControlName="minAmount" class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high px-3 py-2.5 text-on-surface focus:outline-none" />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-semibold text-on-surface">Max Uses</label>
                  <input type="number" formControlName="maxUses" class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high px-3 py-2.5 text-on-surface focus:outline-none" placeholder="Unlimited" />
                </div>
              </div>

              <div>
                <label class="mb-1 block text-sm font-semibold text-on-surface">Expiry Date</label>
                <input type="date" formControlName="expiresAt" class="w-full rounded-xl border border-outline-variant/50 bg-surface-container-high px-3 py-2.5 text-on-surface [color-scheme:dark] focus:outline-none" />
              </div>

              <div class="mt-4 flex justify-end gap-3">
                <button type="button" (click)="showModal.set(false)" class="rounded-xl border border-outline-variant/50 px-5 py-2.5 text-sm font-bold text-on-surface hover:bg-surface-container-high">
                  Cancel
                </button>
                <button type="submit" [disabled]="form.invalid" class="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary hover:brightness-110">
                  Save Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class ManagePromotionsComponent implements OnInit {
  private readonly promotionService = inject(PromotionService);
  private readonly fb = inject(FormBuilder);

  readonly promotions = signal<Promotion[]>([]);
  readonly loading = signal(true);
  readonly showModal = signal(false);

  readonly form = this.fb.group({
    code: ['', Validators.required],
    description: [''],
    discountType: ['percent', Validators.required],
    value: [10, [Validators.required, Validators.min(0)]],
    minAmount: [0, [Validators.required, Validators.min(0)]],
    maxUses: [null as number | null],
    expiresAt: [''],
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
}
