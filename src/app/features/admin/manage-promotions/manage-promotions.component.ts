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
    <div style="background: #FBF9F9; min-height: 100%; padding: 24px;">

      <!-- ==================== HEADER ==================== -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <h1 style="font-size: 28px; font-weight: 700; color: #1B1C1C; margin: 0;">Promotions</h1>
          <span style="background: #E5EEFF; color: #005DAC; padding: 2px 14px; border-radius: 20px; font-size: 14px; font-weight: 600; line-height: 28px;">
            {{ promotions().length }} active
          </span>
        </div>
        <button (click)="openAddModal()"
                style="background: #005DAC; color: #FFFFFF; border: none; border-radius: 8px; padding: 10px 24px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background 0.15s;"
                onmouseover="this.style.background='#004080'" onmouseout="this.style.background='#005DAC'">
          <span class="material-symbols-outlined" style="font-size: 18px;">add</span>
          Add Promotion
        </button>
      </div>

      <!-- ==================== TABLE ==================== -->
      @if (loading()) {
        <div style="background: #FFFFFF; border: 1px solid #E9E8E7; border-radius: 12px; overflow: hidden;">
          @for (i of [1,2,3]; track i) {
            <div style="padding: 16px 24px; border-bottom: 1px solid #F0EFEF; display: flex; gap: 16px; align-items: center;">
              <div style="flex: 1.5;"><div class="skeleton" style="height: 14px; width: 50%;"></div></div>
              <div style="flex: 1;"><div class="skeleton" style="height: 14px; width: 40%;"></div></div>
              <div style="flex: 1;"><div class="skeleton" style="height: 14px; width: 40%;"></div></div>
              <div style="flex: 1;"><div class="skeleton" style="height: 14px; width: 30%;"></div></div>
              <div style="flex: 1;"><div class="skeleton" style="height: 14px; width: 35%;"></div></div>
            </div>
          }
        </div>
      } @else if (promotions().length === 0) {
        <div style="background: #FFFFFF; border: 1px solid #E9E8E7; border-radius: 12px; text-align: center; padding: 80px 20px;">
          <span class="material-symbols-outlined" style="font-size: 48px; color: #C1C6D4; margin-bottom: 12px;">local_offer</span>
          <p style="font-size: 18px; font-weight: 600; color: #717783; margin: 0 0 4px;">No promotions created</p>
          <p style="font-size: 14px; color: #76777D; margin: 0;">Create your first promotion to start offering discounts.</p>
        </div>
      } @else {
        <div style="background: #FFFFFF; border: 1px solid #E9E8E7; border-radius: 12px; overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #F5F3F3;">
                <th style="padding: 12px 24px; text-align: left; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Code</th>
                <th style="padding: 12px 24px; text-align: left; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Discount</th>
                <th style="padding: 12px 24px; text-align: left; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Min Spend</th>
                <th style="padding: 12px 24px; text-align: center; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Usage</th>
                <th style="padding: 12px 24px; text-align: left; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Expiry</th>
                <th style="padding: 12px 24px; text-align: center; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Status</th>
                <th style="padding: 12px 24px; text-align: right; font-size: 12px; font-weight: 700; color: #49454F; text-transform: uppercase; letter-spacing: 0.5px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (promo of promotions(); track promo._id) {
                <tr style="border-bottom: 1px solid #F0EFEF;">
                  <td style="padding: 16px 24px;">
                    <p style="font-size: 14px; font-weight: 700; color: #005DAC; margin: 0; letter-spacing: 0.5px;">{{ promo.code }}</p>
                    <p style="font-size: 12px; color: #717783; margin: 2px 0 0;">{{ promo.description || '—' }}</p>
                  </td>
                  <td style="padding: 16px 24px;">
                    <span style="font-size: 15px; font-weight: 700; color: #1B1C1C;">
                      {{ promo.discountType === 'percent' ? promo.value + '%' : '$' + promo.value }}
                    </span>
                  </td>
                  <td style="padding: 16px 24px;">
                    <span style="font-size: 14px; color: #414752;">\${{ promo.minAmount }}</span>
                  </td>
                  <td style="padding: 16px 24px; text-align: center;">
                    <div style="display: flex; align-items: center; gap: 6px; justify-content: center;">
                      <div style="flex: 1; max-width: 80px; height: 6px; border-radius: 3px; background: #F0EFEF; overflow: hidden;">
                        <div style="height: 100%; border-radius: 3px; background: #005DAC; width: {{ promo.maxUses ? (promo.usedCount / promo.maxUses * 100) + '%' : (promo.usedCount > 0 ? '50%' : '0%') }};"></div>
                      </div>
                      <span style="font-size: 13px; font-weight: 600; color: #717783;">{{ promo.usedCount }}{{ promo.maxUses ? '/' + promo.maxUses : '' }}</span>
                    </div>
                  </td>
                  <td style="padding: 16px 24px;">
                    <span style="font-size: 13px; color: {{ isExpired(promo) ? '#B3261E' : '#717783' }};">
                      {{ promo.expiresAt ? (promo.expiresAt | date) : 'Never' }}
                    </span>
                  </td>
                  <td style="padding: 16px 24px; text-align: center;">
                    <span style="display: inline-block; padding: 3px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.3px;
                      background: {{ promo.active && !isExpired(promo) ? '#E7F5ED' : '#FFDAD6' }}; color: {{ promo.active && !isExpired(promo) ? '#1E7B4C' : '#B3261E' }};">
                      {{ promo.active && !isExpired(promo) ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td style="padding: 16px 24px; text-align: right;">
                    <div class="flex items-center justify-end gap-2">
                      <button (click)="toggleActive(promo)"
                              style="background: {{ promo.active ? '#FFDAD6' : '#E7F5ED' }}; color: {{ promo.active ? '#B3261E' : '#1E7B4C' }}; border: none; border-radius: 6px; padding: 6px 12px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap;">
                        {{ promo.active ? 'Disable' : 'Enable' }}
                      </button>
                      <button (click)="deletePromo(promo._id)"
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
      }

      <!-- ==================== ADD PROMOTION MODAL ==================== -->
      @if (showModal()) {
        <div style="position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.45); padding: 16px; backdrop-filter: blur(4px);">
          <div style="width: 100%; max-width: 480px; background: #FFFFFF; border-radius: 16px; padding: 28px; box-shadow: 0 24px 80px rgba(0,0,0,0.2);">
            <div class="flex items-center justify-between mb-6">
              <h2 style="font-size: 22px; font-weight: 700; color: #1B1C1C; margin: 0;">Add New Promotion</h2>
              <button (click)="showModal.set(false)" style="width: 36px; height: 36px; border: none; border-radius: 8px; background: #F5F3F3; cursor: pointer; color: #717783; display: flex; align-items: center; justify-content: center; transition: background 0.15s;"
                      onmouseover="this.style.background='#E9E8E7'" onmouseout="this.style.background='#F5F3F3'">
                <span class="material-symbols-outlined" style="font-size: 20px;">close</span>
              </button>
            </div>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" style="display: flex; flex-direction: column; gap: 18px;">
              <div>
                <label style="display: block; font-size: 13px; font-weight: 600; color: #414752; margin-bottom: 6px;">Promo Code</label>
                <input type="text" formControlName="code" placeholder="e.g. SUMMER20"
                       style="width: 100%; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #1B1C1C; outline: none; box-sizing: border-box; text-transform: uppercase; transition: border-color 0.15s;"
                       onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'" />
              </div>

              <div>
                <label style="display: block; font-size: 13px; font-weight: 600; color: #414752; margin-bottom: 6px;">Description</label>
                <input type="text" formControlName="description" placeholder="e.g. 20% off summer rentals"
                       style="width: 100%; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #1B1C1C; outline: none; box-sizing: border-box; transition: border-color 0.15s;"
                       onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'" />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 600; color: #414752; margin-bottom: 6px;">Discount Type</label>
                  <select formControlName="discountType"
                          style="width: 100%; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #1B1C1C; outline: none; box-sizing: border-box; background: #FFFFFF; cursor: pointer; transition: border-color 0.15s;"
                          onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'">
                    <option value="percent">Percent (%)</option>
                    <option value="fixed">Fixed ($)</option>
                  </select>
                </div>
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 600; color: #414752; margin-bottom: 6px;">Value</label>
                  <input type="number" formControlName="value"
                         style="width: 100%; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #1B1C1C; outline: none; box-sizing: border-box; transition: border-color 0.15s;"
                         onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 600; color: #414752; margin-bottom: 6px;">Min Spend ($)</label>
                  <input type="number" formControlName="minAmount"
                         style="width: 100%; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #1B1C1C; outline: none; box-sizing: border-box; transition: border-color 0.15s;"
                         onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'" />
                </div>
                <div>
                  <label style="display: block; font-size: 13px; font-weight: 600; color: #414752; margin-bottom: 6px;">Max Uses</label>
                  <input type="number" formControlName="maxUses" placeholder="Unlimited"
                         style="width: 100%; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #1B1C1C; outline: none; box-sizing: border-box; transition: border-color 0.15s;"
                         onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'" />
                </div>
              </div>

              <div>
                <label style="display: block; font-size: 13px; font-weight: 600; color: #414752; margin-bottom: 6px;">Expiry Date</label>
                <input type="date" formControlName="expiresAt"
                       style="width: 100%; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #1B1C1C; outline: none; box-sizing: border-box; transition: border-color 0.15s;"
                       onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'" />
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 12px; padding-top: 8px; border-top: 1px solid #F0EFEF;">
                <button type="button" (click)="showModal.set(false)"
                        style="border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 600; color: #717783; background: #FFFFFF; cursor: pointer; transition: border-color 0.15s;"
                        onmouseover="this.style.borderColor='#C1C6D4'" onmouseout="this.style.borderColor='#E9E8E7'">
                  Cancel
                </button>
                <button type="submit" [disabled]="form.invalid"
                        style="border: none; border-radius: 8px; padding: 10px 24px; font-size: 14px; font-weight: 700; color: #FFFFFF; background: #005DAC; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background 0.15s;"
                        onmouseover="this.style.background='#004080'" onmouseout="this.style.background='#005DAC'">
                  <span class="material-symbols-outlined" style="font-size: 18px;">add_circle</span>
                  Save Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
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

  ngOnInit() { this.loadPromotions(); }

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

  isExpired(promo: Promotion): boolean {
    if (!promo.expiresAt) return false;
    return new Date(promo.expiresAt) < new Date();
  }
}
