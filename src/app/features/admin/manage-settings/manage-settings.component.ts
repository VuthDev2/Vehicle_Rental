import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-manage-settings',
  standalone: true,
  template: `
    <div style="background: #FBF9F9; min-height: 100%; padding: 24px;">

      <!-- ==================== HEADER ==================== -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 style="font-size: 28px; font-weight: 700; color: #1B1C1C; margin: 0 0 2px;">Settings</h1>
          <p style="font-size: 15px; color: #717783; margin: 0;">System Configuration</p>
        </div>
        <button (click)="saveChanges()"
                style="background: #005DAC; color: #FFFFFF; border: none; border-radius: 8px; padding: 10px 24px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background 0.15s;"
                onmouseover="this.style.background='#004080'" onmouseout="this.style.background='#005DAC'">
          <span class="material-symbols-outlined" style="font-size: 18px;">save</span>
          Save Changes
        </button>
      </div>

      @if (saved()) {
        <div style="background: #E7F5ED; border: 1px solid #A8D5BA; border-radius: 10px; padding: 12px 18px; margin-bottom: 24px; display: flex; align-items: center; gap: 10px; color: #1E7B4C; font-size: 14px; font-weight: 600;">
          <span class="material-symbols-outlined" style="font-size: 20px;">check_circle</span>
          Settings saved successfully.
        </div>
      }

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- ==================== GENERAL SETTINGS ==================== -->
        <div style="background: #FFFFFF; border: 1px solid #E9E8E7; border-radius: 12px; padding: 24px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: #D4E3FF; display: flex; align-items: center; justify-content: center;">
              <span class="material-symbols-outlined" style="font-size: 20px; color: #005DAC;">settings</span>
            </div>
            <h2 style="font-size: 16px; font-weight: 700; color: #1B1C1C; margin: 0;">General Settings</h2>
          </div>
          <div style="display: flex; flex-direction: column; gap: 18px;">
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; color: #414752; margin-bottom: 6px;">Site Name</label>
              <input type="text" [value]="config().siteName" (input)="updateConfig('siteName', $any($event.target).value)"
                     style="width: 100%; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #1B1C1C; outline: none; box-sizing: border-box; transition: border-color 0.15s;"
                     onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'" />
            </div>
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; color: #414752; margin-bottom: 6px;">Currency</label>
              <select [value]="config().currency" (change)="updateConfig('currency', $any($event.target).value)"
                      style="width: 100%; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #1B1C1C; outline: none; box-sizing: border-box; background: #FFFFFF; cursor: pointer; transition: border-color 0.15s;"
                      onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'">
                <option value="USD">USD — US Dollar</option>
                <option value="KHR">KHR — Cambodian Riel</option>
                <option value="EUR">EUR — Euro</option>
                <option value="THB">THB — Thai Baht</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; color: #414752; margin-bottom: 6px;">Timezone</label>
              <select [value]="config().timezone" (change)="updateConfig('timezone', $any($event.target).value)"
                      style="width: 100%; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #1B1C1C; outline: none; box-sizing: border-box; background: #FFFFFF; cursor: pointer; transition: border-color 0.15s;"
                      onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'">
                <option value="Asia/Phnom_Penh">Asia/Phnom Penh (UTC+7)</option>
                <option value="Asia/Bangkok">Asia/Bangkok (UTC+7)</option>
                <option value="Asia/Singapore">Asia/Singapore (UTC+8)</option>
                <option value="America/New_York">America/New_York (UTC-5)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; color: #414752; margin-bottom: 6px;">Language</label>
              <select [value]="config().language" (change)="updateConfig('language', $any($event.target).value)"
                      style="width: 100%; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #1B1C1C; outline: none; box-sizing: border-box; background: #FFFFFF; cursor: pointer; transition: border-color 0.15s;"
                      onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'">
                <option value="en">English</option>
                <option value="km">Khmer</option>
                <option value="zh">Chinese</option>
                <option value="th">Thai</option>
              </select>
            </div>
          </div>
        </div>

        <!-- ==================== RENTAL SETTINGS ==================== -->
        <div style="background: #FFFFFF; border: 1px solid #E9E8E7; border-radius: 12px; padding: 24px;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: #FFDBC7; display: flex; align-items: center; justify-content: center;">
              <span class="material-symbols-outlined" style="font-size: 20px; color: #8A6D00;">local_offer</span>
            </div>
            <h2 style="font-size: 16px; font-weight: 700; color: #1B1C1C; margin: 0;">Rental Settings</h2>
          </div>
          <div style="display: flex; flex-direction: column; gap: 18px;">
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; color: #414752; margin-bottom: 6px;">Tax Rate (%)</label>
              <input type="number" [value]="config().taxRate" (input)="updateConfig('taxRate', Number($any($event.target).value))"
                     style="width: 100%; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #1B1C1C; outline: none; box-sizing: border-box; transition: border-color 0.15s;"
                     onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'" />
            </div>
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; color: #414752; margin-bottom: 6px;">Default Deposit ($)</label>
              <input type="number" [value]="config().defaultDeposit" (input)="updateConfig('defaultDeposit', Number($any($event.target).value))"
                     style="width: 100%; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #1B1C1C; outline: none; box-sizing: border-box; transition: border-color 0.15s;"
                     onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'" />
            </div>
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; color: #414752; margin-bottom: 6px;">Cancellation Period (hours)</label>
              <input type="number" [value]="config().cancellationPeriod" (input)="updateConfig('cancellationPeriod', Number($any($event.target).value))"
                     style="width: 100%; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #1B1C1C; outline: none; box-sizing: border-box; transition: border-color 0.15s;"
                     onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'" />
            </div>
            <div>
              <label style="display: block; font-size: 13px; font-weight: 600; color: #414752; margin-bottom: 6px;">Max Rental Duration (days)</label>
              <input type="number" [value]="config().maxDuration" (input)="updateConfig('maxDuration', Number($any($event.target).value))"
                     style="width: 100%; border: 1px solid #E9E8E7; border-radius: 8px; padding: 10px 14px; font-size: 14px; color: #1B1C1C; outline: none; box-sizing: border-box; transition: border-color 0.15s;"
                     onfocus="this.style.borderColor='#005DAC'" onblur="this.style.borderColor='#E9E8E7'" />
            </div>
          </div>
        </div>

        <!-- ==================== NOTIFICATION SETTINGS ==================== -->
        <div style="background: #FFFFFF; border: 1px solid #E9E8E7; border-radius: 12px; padding: 24px; grid-column: 1 / -1;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: #CFE6F2; display: flex; align-items: center; justify-content: center;">
              <span class="material-symbols-outlined" style="font-size: 20px; color: #00668C;">notifications</span>
            </div>
            <h2 style="font-size: 16px; font-weight: 700; color: #1B1C1C; margin: 0;">Notification Settings</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            @for (notif of notifications; track notif.key) {
              <div style="border: 1px solid #F0EFEF; border-radius: 10px; padding: 16px;">
                <div class="flex items-center justify-between mb-3">
                  <h3 style="font-size: 14px; font-weight: 700; color: #1B1C1C; margin: 0;">{{ notif.label }}</h3>
                  <label style="position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer;">
                    <input type="checkbox" [checked]="config().notifications[notif.key]" (change)="toggleNotification(notif.key)"
                           style="opacity: 0; width: 0; height: 0; position: absolute;" />
                    <span style="position: absolute; inset: 0; background: {{ config().notifications[notif.key] ? '#005DAC' : '#C1C6D4' }}; border-radius: 12px; transition: background 0.2s;">
                      <span style="position: absolute; top: 2px; left: {{ config().notifications[notif.key] ? '22px' : '2px' }}; width: 20px; height: 20px; background: #FFFFFF; border-radius: 50%; transition: left 0.2s;"></span>
                    </span>
                  </label>
                </div>
                <p style="font-size: 13px; color: #717783; margin: 0; line-height: 1.4;">{{ notif.desc }}</p>
              </div>
            }
          </div>
        </div>

      </div>

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
export class ManageSettingsComponent {
  protected readonly Number = Number;
  readonly saved = signal(false);

  readonly config = signal({
    siteName: 'Cambo Rent',
    currency: 'USD',
    timezone: 'Asia/Phnom_Penh',
    language: 'en',
    taxRate: 10,
    defaultDeposit: 100,
    cancellationPeriod: 24,
    maxDuration: 30,
    notifications: {
      bookingConfirmation: true,
      paymentReceipt: true,
      reminder: false,
      promotions: false,
    },
  });

  readonly notifications = [
    { key: 'bookingConfirmation' as const, label: 'Booking Confirmation', desc: 'Notify customers when a booking is confirmed.' },
    { key: 'paymentReceipt' as const, label: 'Payment Receipt', desc: 'Send a receipt after successful payment.' },
    { key: 'reminder' as const, label: 'Reminder', desc: 'Remind customers of upcoming pickups.' },
    { key: 'promotions' as const, label: 'Promotions', desc: 'Notify about special offers and discounts.' },
  ];

  updateConfig(key: string, value: string | number) {
    this.config.update(c => ({ ...c, [key]: value }));
    this.saved.set(false);
  }

  toggleNotification(key: string) {
    this.config.update(c => ({
      ...c,
      notifications: { ...c.notifications, [key]: !c.notifications[key as keyof typeof c.notifications] },
    }));
    this.saved.set(false);
  }

  saveChanges() {
    localStorage.setItem('admin_settings', JSON.stringify(this.config()));
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 3000);
  }
}
