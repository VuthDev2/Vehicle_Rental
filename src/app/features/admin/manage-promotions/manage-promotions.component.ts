import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PromotionService } from '../../../core/services/promotion.service';
import { Promotion } from '../../../models/promotion.model';

@Component({
  selector: 'app-manage-promotions',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, DatePipe],
  template: `
    <div style="background: #F8F9FA; min-height: 100vh; padding: 28px 32px;">

      <!-- ==================== HEADER ==================== -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <div class="flex items-center gap-3">
            <h1 style="font-size: 26px; font-weight: 800; color: #1A1A2E; margin: 0; letter-spacing: -0.5px;">Promotions</h1>
            <span style="background: #E5EEFF; color: #005DAC; padding: 2px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; line-height: 28px;">
              {{ promotions().length }} total
            </span>
          </div>
          <p style="font-size: 14px; color: #6B7280; margin: 4px 0 0;">Create and manage discount promotions for your customers</p>
        </div>
        <button (click)="openAddModal()"
                style="background: #005DAC; color: #FFFFFF; border: none; border-radius: 10px; padding: 12px 24px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 2px 8px rgba(0,93,172,0.25); transition: all 0.15s;"
                onmouseover="this.style.background='#004080';this.style.boxShadow='0 4px 12px rgba(0,93,172,0.35)'"
                onmouseout="this.style.background='#005DAC';this.style.boxShadow='0 2px 8px rgba(0,93,172,0.25)'">
          <span class="material-symbols-outlined" style="font-size: 20px;">add</span>
          New Promotion
        </button>
      </div>

      <!-- ==================== STATISTICS ==================== -->
      <div class="grid grid-cols-4 gap-5 mb-8">
        <div class="stat-item" style="background: #FFFFFF; border-radius: 12px; padding: 18px 20px; border: 1px solid #F0F0F0; box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: all 0.2s; cursor: default;"
             onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)'"
             onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'">
          <div class="flex items-center gap-3 mb-3">
            <div style="width: 40px; height: 40px; border-radius: 10px; background: #E7F5ED; display: flex; align-items: center; justify-content: center;">
              <span class="material-symbols-outlined" style="color: #059669; font-size: 22px;">check_circle</span>
            </div>
          </div>
          <p style="font-size: 22px; font-weight: 800; color: #1A1A2E; margin: 0; line-height: 1.2;">{{ activeCount() }}</p>
          <p style="font-size: 12px; color: #6B7280; margin: 4px 0 0; font-weight: 500;">Active Promotions</p>
        </div>
        <div class="stat-item" style="background: #FFFFFF; border-radius: 12px; padding: 18px 20px; border: 1px solid #F0F0F0; box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: all 0.2s; cursor: default;"
             onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)'"
             onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'">
          <div class="flex items-center gap-3 mb-3">
            <div style="width: 40px; height: 40px; border-radius: 10px; background: #FFF3E0; display: flex; align-items: center; justify-content: center;">
              <span class="material-symbols-outlined" style="color: #E65100; font-size: 22px;">schedule</span>
            </div>
          </div>
          <p style="font-size: 22px; font-weight: 800; color: #1A1A2E; margin: 0; line-height: 1.2;">{{ expiredCount() }}</p>
          <p style="font-size: 12px; color: #6B7280; margin: 4px 0 0; font-weight: 500;">Expired</p>
        </div>
        <div class="stat-item" style="background: #FFFFFF; border-radius: 12px; padding: 18px 20px; border: 1px solid #F0F0F0; box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: all 0.2s; cursor: default;"
             onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)'"
             onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'">
          <div class="flex items-center gap-3 mb-3">
            <div style="width: 40px; height: 40px; border-radius: 10px; background: #F3F0FF; display: flex; align-items: center; justify-content: center;">
              <span class="material-symbols-outlined" style="color: #7C3AED; font-size: 22px;">block</span>
            </div>
          </div>
          <p style="font-size: 22px; font-weight: 800; color: #1A1A2E; margin: 0; line-height: 1.2;">{{ disabledCount() }}</p>
          <p style="font-size: 12px; color: #6B7280; margin: 4px 0 0; font-weight: 500;">Disabled</p>
        </div>
        <div class="stat-item" style="background: #FFFFFF; border-radius: 12px; padding: 18px 20px; border: 1px solid #F0F0F0; box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: all 0.2s; cursor: default;"
             onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)'"
             onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)'">
          <div class="flex items-center gap-3 mb-3">
            <div style="width: 40px; height: 40px; border-radius: 10px; background: #E5EEFF; display: flex; align-items: center; justify-content: center;">
              <span class="material-symbols-outlined" style="color: #005DAC; font-size: 22px;">confirmation_number</span>
            </div>
          </div>
          <p style="font-size: 22px; font-weight: 800; color: #1A1A2E; margin: 0; line-height: 1.2;">{{ totalRedemptions() }}</p>
          <p style="font-size: 12px; color: #6B7280; margin: 4px 0 0; font-weight: 500;">Total Redemptions</p>
        </div>
      </div>

      <!-- ==================== FILTERS ==================== -->
      <div style="background: #FFFFFF; border-radius: 12px; padding: 16px 20px; border: 1px solid #F0F0F0; box-shadow: 0 1px 3px rgba(0,0,0,0.04); margin-bottom: 20px;">
        <div class="flex items-center gap-3 flex-wrap">
          <div style="position: relative; flex: 1; min-width: 240px; max-width: 320px;">
            <span class="material-symbols-outlined" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 18px; color: #9CA3AF; pointer-events: none;">search</span>
            <input type="text" [(ngModel)]="searchQuery" placeholder="Search by code or description..."
                   style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 9px 14px 9px 38px; font-size: 13px; color: #1A1A2E; outline: none; box-sizing: border-box; transition: border-color 0.15s, box-shadow 0.15s; background: #F9FAFB;"
                   onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)';this.style.background='#FFFFFF'"
                   onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none';this.style.background='#F9FAFB'" />
          </div>
          <select [(ngModel)]="statusFilter"
                  style="border: 1px solid #E5E7EB; border-radius: 10px; padding: 9px 14px; font-size: 13px; color: #1A1A2E; outline: none; background: #F9FAFB; cursor: pointer; min-width: 140px; transition: border-color 0.15s, box-shadow 0.15s;"
                  onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)';this.style.background='#FFFFFF'"
                  onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none';this.style.background='#F9FAFB'">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="disabled">Disabled</option>
          </select>
          <select [(ngModel)]="typeFilter"
                  style="border: 1px solid #E5E7EB; border-radius: 10px; padding: 9px 14px; font-size: 13px; color: #1A1A2E; outline: none; background: #F9FAFB; cursor: pointer; min-width: 140px; transition: border-color 0.15s, box-shadow 0.15s;"
                  onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)';this.style.background='#FFFFFF'"
                  onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none';this.style.background='#F9FAFB'">
            <option value="all">All Types</option>
            <option value="percent">Percent (%)</option>
            <option value="fixed">Fixed ($)</option>
          </select>
          <select [(ngModel)]="sortBy"
                  style="border: 1px solid #E5E7EB; border-radius: 10px; padding: 9px 14px; font-size: 13px; color: #1A1A2E; outline: none; background: #F9FAFB; cursor: pointer; min-width: 140px; transition: border-color 0.15s, box-shadow 0.15s;"
                  onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)';this.style.background='#FFFFFF'"
                  onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none';this.style.background='#F9FAFB'">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="code">Code A-Z</option>
            <option value="uses">Most Used</option>
          </select>
          @if (searchQuery() || statusFilter() !== 'all' || typeFilter() !== 'all') {
            <button (click)="clearFilters()"
                    style="border: none; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; color: #6B7280; background: #F3F4F6; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.15s; white-space: nowrap;"
                    onmouseover="this.style.background='#E5E7EB';this.style.color='#374151'"
                    onmouseout="this.style.background='#F3F4F6';this.style.color='#6B7280'">
              <span class="material-symbols-outlined" style="font-size: 16px;">close</span>
              Clear
            </button>
          }
        </div>
      </div>

      <!-- ==================== LOADING ==================== -->
      @if (loading()) {
        <div class="grid grid-cols-3 gap-5">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div style="background: #FFFFFF; border-radius: 14px; border: 1px solid #F0F0F0; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div class="flex items-center justify-between mb-5">
                <div class="skeleton" style="height: 16px; width: 100px; border-radius: 4px;"></div>
                <div class="skeleton" style="height: 24px; width: 70px; border-radius: 12px;"></div>
              </div>
              <div class="skeleton" style="height: 36px; width: 80%; border-radius: 6px; margin-bottom: 12px;"></div>
              <div class="skeleton" style="height: 12px; width: 60%; border-radius: 4px; margin-bottom: 16px;"></div>
              <div class="skeleton" style="height: 8px; width: 100%; border-radius: 4px; margin-bottom: 16px;"></div>
              <div class="flex justify-between">
                <div class="skeleton" style="height: 12px; width: 40%; border-radius: 4px;"></div>
                <div class="skeleton" style="height: 12px; width: 30%; border-radius: 4px;"></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- ==================== EMPTY ==================== -->
      @else if (filteredPromotions().length === 0) {
        <div style="background: #FFFFFF; border-radius: 14px; border: 1px solid #F0F0F0; text-align: center; padding: 80px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: #F3F4F6; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <span class="material-symbols-outlined" style="font-size: 40px; color: #9CA3AF;">local_offer</span>
          </div>
          <p style="font-size: 18px; font-weight: 700; color: #1A1A2E; margin: 0 0 4px;">
            {{ searchQuery() || statusFilter() !== 'all' || typeFilter() !== 'all' ? 'No promotions match your filters' : 'No promotions created' }}
          </p>
          <p style="font-size: 14px; color: #6B7280; margin: 0 0 24px;">
            {{ searchQuery() || statusFilter() !== 'all' || typeFilter() !== 'all' ? 'Try adjusting your search or filters' : 'Create your first promotion to start offering discounts to customers.' }}
          </p>
          @if (!searchQuery() && statusFilter() === 'all' && typeFilter() === 'all') {
            <button (click)="openAddModal()"
                    style="background: #005DAC; color: #FFFFFF; border: none; border-radius: 10px; padding: 12px 24px; font-size: 14px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 2px 8px rgba(0,93,172,0.25); transition: all 0.15s;"
                    onmouseover="this.style.background='#004080'"
                    onmouseout="this.style.background='#005DAC'">
              <span class="material-symbols-outlined" style="font-size: 20px;">add</span>
              Create Promotion
            </button>
          }
        </div>
      }

      <!-- ==================== PROMOTION CARDS GRID ==================== -->
      @else {
        <div class="grid grid-cols-3 gap-5">
          @for (promo of paginatedPromotions(); track promo._id) {
            <div style="background: #FFFFFF; border-radius: 14px; border: 1px solid #F0F0F0; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); transition: all 0.2s; display: flex; flex-direction: column;"
                 onmouseover="this.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)';this.style.borderColor='#E5E7EB'"
                 onmouseout="this.style.boxShadow='0 1px 3px rgba(0,0,0,0.04)';this.style.borderColor='#F0F0F0'">
              <!-- Card Header -->
              <div class="flex items-start justify-between mb-3">
                <div>
                  <span style="font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; font-weight: 700; color: #6B7280; letter-spacing: 1px; text-transform: uppercase;">{{ promo.code }}</span>
                </div>
                <span style="display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; white-space: nowrap; letter-spacing: 0.3px;
                  background: {{ getStatus(promo) === 'active' ? '#E7F5ED' : getStatus(promo) === 'expired' ? '#FFEAEA' : '#F3F4F6' }};
                  color: {{ getStatus(promo) === 'active' ? '#059669' : getStatus(promo) === 'expired' ? '#DC2626' : '#6B7280' }};
                  border: 1px solid {{ getStatus(promo) === 'active' ? '#D1FAE5' : getStatus(promo) === 'expired' ? '#FEE2E2' : '#E5E7EB' }};">
                  <span style="width: 5px; height: 5px; border-radius: 50%;
                    background: {{ getStatus(promo) === 'active' ? '#059669' : getStatus(promo) === 'expired' ? '#DC2626' : '#9CA3AF' }};">
                  </span>
                  {{ getStatusLabel(promo) }}
                </span>
              </div>

              <!-- Discount Display -->
              <div class="mb-3">
                <span style="font-size: 32px; font-weight: 900; color: #005DAC; letter-spacing: -1px; line-height: 1.1;">
                  {{ promo.discountType === 'percent' ? promo.value + '%' : '$' + promo.value }}
                </span>
                <span style="font-size: 14px; font-weight: 600; color: #6B7280; margin-left: 4px;">
                  {{ promo.discountType === 'percent' ? 'OFF' : 'OFF' }}
                </span>
              </div>

              <!-- Description -->
              <p style="font-size: 13px; color: #6B7280; margin: 0 0 16px; line-height: 1.4; flex: 1;">
                {{ promo.description || 'No description' }}
              </p>

              <!-- Usage Progress -->
              <div class="mb-4">
                <div class="flex items-center justify-between mb-1">
                  <span style="font-size: 11px; font-weight: 600; color: #6B7280;">Usage</span>
                  <span style="font-size: 12px; font-weight: 700; color: #1A1A2E;">
                    {{ promo.usedCount }}{{ promo.maxUses ? '/' + promo.maxUses : '' }}
                  </span>
                </div>
                <div style="width: 100%; height: 6px; border-radius: 3px; background: #F0EFEF; overflow: hidden;">
                  @let usagePct = promo.maxUses ? (promo.usedCount / promo.maxUses * 100) : (promo.usedCount > 0 ? 50 : 0);
                  <div style="height: 100%; border-radius: 3px; background: linear-gradient(90deg, #005DAC, #3980F4); width: {{ usagePct > 100 ? 100 : usagePct }}%; transition: width 0.5s ease;"></div>
                </div>
              </div>

              <!-- Details Row -->
              <div class="flex items-center justify-between pt-3" style="border-top: 1px solid #F3F4F6;">
                <div class="flex items-center gap-1">
                  <span class="material-symbols-outlined" style="font-size: 14px; color: #9CA3AF;">payments</span>
                  <span style="font-size: 12px; color: #6B7280; font-weight: 500;">Min \${{ promo.minAmount }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="material-symbols-outlined" style="font-size: 14px; color: #9CA3AF;">calendar_today</span>
                  <span style="font-size: 12px; color: {{ isExpired(promo) ? '#DC2626' : '#6B7280' }}; font-weight: 500;">
                    {{ promo.expiresAt ? (promo.expiresAt | date:'mediumDate') : 'No expiry' }}
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-end gap-2 mt-4 pt-3" style="border-top: 1px solid #F3F4F6;">
                <button (click)="openDetailDrawer(promo)"
                        style="width: 32px; height: 32px; border: none; border-radius: 8px; background: transparent; cursor: pointer; color: #9CA3AF; display: flex; align-items: center; justify-content: center; transition: all 0.15s;"
                        onmouseover="this.style.background='#F3F4F6';this.style.color='#374151'"
                        onmouseout="this.style.background='transparent';this.style.color='#9CA3AF'"
                        title="View details">
                  <span class="material-symbols-outlined" style="font-size: 18px;">visibility</span>
                </button>
                <button (click)="toggleActive(promo)"
                        style="width: 32px; height: 32px; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s;
                          background: {{ promo.active ? '#FFEAEA' : '#E7F5ED' }}; color: {{ promo.active ? '#DC2626' : '#059669' }};"
                        onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'"
                        title="{{ promo.active ? 'Disable' : 'Enable' }}">
                  <span class="material-symbols-outlined" style="font-size: 18px;">{{ promo.active ? 'toggle_off' : 'toggle_on' }}</span>
                </button>
                <button (click)="deletePromo(promo._id)"
                        style="width: 32px; height: 32px; border: none; border-radius: 8px; background: transparent; cursor: pointer; color: #9CA3AF; display: flex; align-items: center; justify-content: center; transition: all 0.15s;"
                        onmouseover="this.style.background='#FFEAEA';this.style.color='#DC2626'"
                        onmouseout="this.style.background='transparent';this.style.color='#9CA3AF'"
                        title="Delete">
                  <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
                </button>
              </div>
            </div>
          }
        </div>

        <!-- ==================== PAGINATION ==================== -->
        @if (totalPages() > 1) {
          <div class="flex items-center justify-between mt-6">
            <span style="font-size: 13px; color: #6B7280;">
              Showing {{ (currentPage() - 1) * pageSize + 1 }}–{{ Math.min(currentPage() * pageSize, filteredPromotions().length) }} of {{ filteredPromotions().length }}
            </span>
            <div class="flex items-center gap-1">
              <button (click)="setPage(currentPage() - 1)" [disabled]="currentPage() === 1"
                      style="width: 34px; height: 34px; border: 1px solid #E5E7EB; border-radius: 8px; background: #FFFFFF; cursor: pointer; display: flex; align-items: center; justify-content: center; color: {{ currentPage() === 1 ? '#D1D5DB' : '#374151' }}; transition: all 0.15s;"
                      onmouseover="if(!this.disabled){this.style.background='#F9FAFB'}" onmouseout="if(!this.disabled){this.style.background='#FFFFFF'}">
                <span class="material-symbols-outlined" style="font-size: 18px;">chevron_left</span>
              </button>
              @for (page of pageNumbers(); track page) {
                <button (click)="setPage(page)"
                        style="min-width: 34px; height: 34px; border: {{ page === currentPage() ? 'none' : '1px solid #E5E7EB' }}; border-radius: 8px; background: {{ page === currentPage() ? '#005DAC' : '#FFFFFF' }}; color: {{ page === currentPage() ? '#FFFFFF' : '#374151' }}; cursor: pointer; font-size: 13px; font-weight: 600; padding: 0 8px; transition: all 0.15s;"
                        onmouseover="if(this.style.background!=='#005DAC'){this.style.background='#F9FAFB'}" onmouseout="if(this.style.background!=='#005DAC'){this.style.background='#FFFFFF'}">
                  {{ page }}
                </button>
              }
              <button (click)="setPage(currentPage() + 1)" [disabled]="currentPage() === totalPages()"
                      style="width: 34px; height: 34px; border: 1px solid #E5E7EB; border-radius: 8px; background: #FFFFFF; cursor: pointer; display: flex; align-items: center; justify-content: center; color: {{ currentPage() === totalPages() ? '#D1D5DB' : '#374151' }}; transition: all 0.15s;"
                      onmouseover="if(!this.disabled){this.style.background='#F9FAFB'}" onmouseout="if(!this.disabled){this.style.background='#FFFFFF'}">
                <span class="material-symbols-outlined" style="font-size: 18px;">chevron_right</span>
              </button>
            </div>
          </div>
        }
      }

      <!-- ==================== ADD PROMOTION MODAL (Wizard-style) ==================== -->
      @if (showModal()) {
        <div style="position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); padding: 16px; backdrop-filter: blur(4px);"
             (click)="showModal.set(false)">
          <div style="width: 100%; max-width: 540px; background: #FFFFFF; border-radius: 16px; box-shadow: 0 24px 80px rgba(0,0,0,0.2); animation: scale-in 0.2s ease;"
               (click)="$event.stopPropagation()">
            <!-- Modal Header -->
            <div class="flex items-center justify-between px-7 pt-7 pb-4">
              <div>
                <h2 style="font-size: 20px; font-weight: 800; color: #1A1A2E; margin: 0;">New Promotion</h2>
                <p style="font-size: 13px; color: #6B7280; margin: 2px 0 0;">Create a discount promotion for your customers</p>
              </div>
              <button (click)="showModal.set(false)"
                      style="width: 36px; height: 36px; border: none; border-radius: 10px; background: #F3F4F6; cursor: pointer; color: #6B7280; display: flex; align-items: center; justify-content: center; transition: all 0.15s;"
                      onmouseover="this.style.background='#E5E7EB';this.style.color='#374151'"
                      onmouseout="this.style.background='#F3F4F6';this.style.color='#6B7280'">
                <span class="material-symbols-outlined" style="font-size: 20px;">close</span>
              </button>
            </div>

            <!-- Form -->
            <form [formGroup]="form" (ngSubmit)="onSubmit()" style="padding: 0 28px 28px;">
              <div style="display: flex; flex-direction: column; gap: 18px;">
                <!-- Code + Type -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 5px; letter-spacing: 0.3px; text-transform: uppercase;">Promo Code</label>
                    <input type="text" formControlName="code" placeholder="e.g. SUMMER20"
                           style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; text-transform: uppercase; transition: border-color 0.15s, box-shadow 0.15s; background: #F9FAFB;"
                           onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)';this.style.background='#FFFFFF'"
                           onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none';this.style.background='#F9FAFB'" />
                    @if (form.get('code')?.invalid && form.get('code')?.touched) {
                      <span style="font-size: 11px; color: #DC2626; margin-top: 3px; display: block;">Code is required</span>
                    }
                  </div>
                  <div>
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 5px; letter-spacing: 0.3px; text-transform: uppercase;">Discount Type</label>
                    <select formControlName="discountType"
                            style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; background: #F9FAFB; cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s;"
                            onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)';this.style.background='#FFFFFF'"
                            onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none';this.style.background='#F9FAFB'">
                      <option value="percent">Percent (%)</option>
                      <option value="fixed">Fixed ($)</option>
                    </select>
                  </div>
                </div>

                <!-- Description -->
                <div>
                  <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 5px; letter-spacing: 0.3px; text-transform: uppercase;">Description</label>
                  <input type="text" formControlName="description" placeholder="e.g. 20% off summer rentals"
                         style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; transition: border-color 0.15s, box-shadow 0.15s; background: #F9FAFB;"
                         onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)';this.style.background='#FFFFFF'"
                         onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none';this.style.background='#F9FAFB'" />
                </div>

                <!-- Value + Min Spend -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 5px; letter-spacing: 0.3px; text-transform: uppercase;">Discount Value</label>
                    <div style="position: relative;">
                      <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 14px; color: #9CA3AF; pointer-events: none;">{{ form.get('discountType')?.value === 'percent' ? '%' : '$' }}</span>
                      <input type="number" formControlName="value" min="0"
                             style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px 10px 32px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; transition: border-color 0.15s, box-shadow 0.15s; background: #F9FAFB;"
                             onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)';this.style.background='#FFFFFF'"
                             onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none';this.style.background='#F9FAFB'" />
                    </div>
                  </div>
                  <div>
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 5px; letter-spacing: 0.3px; text-transform: uppercase;">Min Spend ($)</label>
                    <input type="number" formControlName="minAmount" min="0"
                           style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; transition: border-color 0.15s, box-shadow 0.15s; background: #F9FAFB;"
                           onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)';this.style.background='#FFFFFF'"
                           onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none';this.style.background='#F9FAFB'" />
                  </div>
                </div>

                <!-- Max Uses + Expiry -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 5px; letter-spacing: 0.3px; text-transform: uppercase;">Max Uses</label>
                    <input type="number" formControlName="maxUses" placeholder="Unlimited"
                           style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; transition: border-color 0.15s, box-shadow 0.15s; background: #F9FAFB;"
                           onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)';this.style.background='#FFFFFF'"
                           onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none';this.style.background='#F9FAFB'" />
                  </div>
                  <div>
                    <label style="display: block; font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 5px; letter-spacing: 0.3px; text-transform: uppercase;">Expiry Date</label>
                    <input type="date" formControlName="expiresAt"
                           style="width: 100%; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 14px; font-size: 14px; color: #1A1A2E; outline: none; box-sizing: border-box; transition: border-color 0.15s, box-shadow 0.15s; background: #F9FAFB;"
                           onfocus="this.style.borderColor='#3980F4';this.style.boxShadow='0 0 0 3px rgba(57,128,244,0.12)';this.style.background='#FFFFFF'"
                           onblur="this.style.borderColor='#E5E7EB';this.style.boxShadow='none';this.style.background='#F9FAFB'" />
                  </div>
                </div>
              </div>

              <!-- Modal Footer -->
              <div class="flex items-center justify-end gap-3 mt-6 pt-5" style="border-top: 1px solid #F3F4F6;">
                <button type="button" (click)="showModal.set(false)"
                        style="border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 20px; font-size: 13px; font-weight: 600; color: #374151; background: #FFFFFF; cursor: pointer; transition: all 0.15s;"
                        onmouseover="this.style.background='#F9FAFB';this.style.borderColor='#D1D5DB'"
                        onmouseout="this.style.background='#FFFFFF';this.style.borderColor='#E5E7EB'">
                  Cancel
                </button>
                <button type="submit" [disabled]="form.invalid"
                        style="border: none; border-radius: 10px; padding: 10px 24px; font-size: 13px; font-weight: 700; color: #FFFFFF; background: #005DAC; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(0,93,172,0.25); transition: all 0.15s; opacity: {{ form.invalid ? 0.5 : 1 }};"
                        onmouseover="if(!this.disabled){this.style.background='#004080'}" onmouseout="if(!this.disabled){this.style.background='#005DAC'}">
                  <span class="material-symbols-outlined" style="font-size: 18px;">add_circle</span>
                  Create Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- ==================== DETAIL DRAWER ==================== -->
      @if (selectedPromo(); as promo) {
        <div style="position: fixed; inset: 0; z-index: 50; display: flex; justify-content: flex-end; background: rgba(0,0,0,0.35); backdrop-filter: blur(4px);"
             (click)="selectedPromo.set(null)">
          <div style="width: 100%; max-width: 480px; background: #FFFFFF; height: 100%; overflow-y: auto; box-shadow: -8px 0 40px rgba(0,0,0,0.12); animation: slide-in-right 0.25s ease;"
               (click)="$event.stopPropagation()">
            <!-- Drawer Header -->
            <div class="flex items-center justify-between p-6" style="border-bottom: 1px solid #F3F4F6;">
              <div class="flex items-center gap-3">
                <div style="width: 44px; height: 44px; border-radius: 12px; background: #E5EEFF; display: flex; align-items: center; justify-content: center;">
                  <span class="material-symbols-outlined" style="color: #005DAC; font-size: 24px;">local_offer</span>
                </div>
                <div>
                  <h3 style="font-size: 18px; font-weight: 800; color: #1A1A2E; margin: 0;">{{ promo.code }}</h3>
                  <p style="font-size: 13px; color: #6B7280; margin: 1px 0 0;">Promotion Details</p>
                </div>
              </div>
              <button (click)="selectedPromo.set(null)"
                      style="width: 36px; height: 36px; border: none; border-radius: 10px; background: #F3F4F6; cursor: pointer; color: #6B7280; display: flex; align-items: center; justify-content: center; transition: all 0.15s;"
                      onmouseover="this.style.background='#E5E7EB';this.style.color='#374151'"
                      onmouseout="this.style.background='#F3F4F6';this.style.color='#6B7280'">
                <span class="material-symbols-outlined" style="font-size: 20px;">close</span>
              </button>
            </div>

            <div style="padding: 24px;">
              <!-- Status Badge -->
              <div class="mb-6">
                <span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 700;
                  background: {{ getStatus(promo) === 'active' ? '#E7F5ED' : getStatus(promo) === 'expired' ? '#FFEAEA' : '#F3F4F6' }};
                  color: {{ getStatus(promo) === 'active' ? '#059669' : getStatus(promo) === 'expired' ? '#DC2626' : '#6B7280' }};">
                  <span style="width: 6px; height: 6px; border-radius: 50%; background: {{ getStatus(promo) === 'active' ? '#059669' : getStatus(promo) === 'expired' ? '#DC2626' : '#9CA3AF' }};"></span>
                  {{ getStatusLabel(promo) }}
                </span>
              </div>

              <!-- Discount Hero -->
              <div style="background: linear-gradient(135deg, #E5EEFF, #F0F4FF); border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 48px; font-weight: 900; color: #005DAC; letter-spacing: -2px;">
                  {{ promo.discountType === 'percent' ? promo.value + '%' : '$' + promo.value }}
                </span>
                <span style="font-size: 18px; font-weight: 700; color: #6B7280; margin-left: 6px;">OFF</span>
                @if (promo.minAmount > 0) {
                  <p style="font-size: 13px; color: #6B7280; margin: 4px 0 0;">On orders over \${{ promo.minAmount }}</p>
                }
              </div>

              <!-- Detail Rows -->
              <div style="display: flex; flex-direction: column; gap: 16px;">
                <div class="flex items-center justify-between py-2" style="border-bottom: 1px solid #F3F4F6;">
                  <span style="font-size: 13px; color: #6B7280;">Code</span>
                  <span style="font-size: 14px; font-weight: 700; color: #1A1A2E; font-family: monospace; letter-spacing: 0.5px;">{{ promo.code }}</span>
                </div>
                <div class="flex items-center justify-between py-2" style="border-bottom: 1px solid #F3F4F6;">
                  <span style="font-size: 13px; color: #6B7280;">Description</span>
                  <span style="font-size: 14px; font-weight: 600; color: #1A1A2E;">{{ promo.description || '—' }}</span>
                </div>
                <div class="flex items-center justify-between py-2" style="border-bottom: 1px solid #F3F4F6;">
                  <span style="font-size: 13px; color: #6B7280;">Discount Type</span>
                  <span style="font-size: 14px; font-weight: 600; color: #1A1A2E;">{{ promo.discountType === 'percent' ? 'Percentage' : 'Fixed Amount' }}</span>
                </div>
                <div class="flex items-center justify-between py-2" style="border-bottom: 1px solid #F3F4F6;">
                  <span style="font-size: 13px; color: #6B7280;">Discount Value</span>
                  <span style="font-size: 14px; font-weight: 700; color: #005DAC;">{{ promo.discountType === 'percent' ? promo.value + '%' : '$' + promo.value }}</span>
                </div>
                <div class="flex items-center justify-between py-2" style="border-bottom: 1px solid #F3F4F6;">
                  <span style="font-size: 13px; color: #6B7280;">Min. Spend</span>
                  <span style="font-size: 14px; font-weight: 600; color: #1A1A2E;">\${{ promo.minAmount }}</span>
                </div>
                <div class="flex items-center justify-between py-2" style="border-bottom: 1px solid #F3F4F6;">
                  <span style="font-size: 13px; color: #6B7280;">Usage Limit</span>
                  <span style="font-size: 14px; font-weight: 600; color: #1A1A2E;">{{ promo.maxUses ? promo.maxUses + ' max' : 'Unlimited' }}</span>
                </div>
                <div class="flex items-center justify-between py-2" style="border-bottom: 1px solid #F3F4F6;">
                  <span style="font-size: 13px; color: #6B7280;">Times Used</span>
                  <div class="flex items-center gap-2">
                    <span style="font-size: 14px; font-weight: 700; color: #1A1A2E;">{{ promo.usedCount }}</span>
                    @if (promo.maxUses) {
                      <span style="font-size: 11px; color: #6B7280;">/ {{ promo.maxUses }}</span>
                    }
                  </div>
                </div>
                <div class="flex items-center justify-between py-2" style="border-bottom: 1px solid #F3F4F6;">
                  <span style="font-size: 13px; color: #6B7280;">Expiry Date</span>
                  <span style="font-size: 14px; font-weight: 600; color: {{ isExpired(promo) ? '#DC2626' : '#1A1A2E' }};">
                    {{ promo.expiresAt ? (promo.expiresAt | date:'mediumDate') : 'No expiry' }}
                  </span>
                </div>
                <div class="flex items-center justify-between py-2" style="border-bottom: 1px solid #F3F4F6;">
                  <span style="font-size: 13px; color: #6B7280;">Created</span>
                  <span style="font-size: 14px; font-weight: 600; color: #1A1A2E;">{{ promo.createdAt | date:'mediumDate' }}</span>
                </div>
                <div class="flex items-center justify-between py-2">
                  <span style="font-size: 13px; color: #6B7280;">Active</span>
                  <span style="display: inline-flex; align-items: center; gap: 5px; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 700;
                    background: {{ promo.active ? '#E7F5ED' : '#F3F4F6' }}; color: {{ promo.active ? '#059669' : '#6B7280' }};">
                    <span style="width: 5px; height: 5px; border-radius: 50%; background: {{ promo.active ? '#059669' : '#9CA3AF' }};"></span>
                    {{ promo.active ? 'Enabled' : 'Disabled' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Drawer Footer Actions -->
            <div style="padding: 20px 24px; border-top: 1px solid #F3F4F6; display: flex; gap: 10px;">
              <button (click)="toggleActive(promo); selectedPromo.set(null)"
                      style="flex: 1; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px; font-size: 13px; font-weight: 600; cursor: pointer; background: #FFFFFF; color: {{ promo.active ? '#DC2626' : '#059669' }}; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.15s;"
                      onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background='#FFFFFF'">
                <span class="material-symbols-outlined" style="font-size: 18px;">{{ promo.active ? 'toggle_off' : 'toggle_on' }}</span>
                {{ promo.active ? 'Disable' : 'Enable' }}
              </button>
              <button (click)="deletePromo(promo._id); selectedPromo.set(null)"
                      style="flex: 1; border: 1px solid #FEE2E2; border-radius: 10px; padding: 10px; font-size: 13px; font-weight: 600; cursor: pointer; background: #FFEAEA; color: #DC2626; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.15s;"
                      onmouseover="this.style.background='#FEE2E2'" onmouseout="this.style.background='#FFEAEA'">
                <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
                Delete
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
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
