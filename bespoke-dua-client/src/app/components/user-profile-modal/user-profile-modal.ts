import { Component, EventEmitter, OnInit, Output, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../domain/services/auth.service';
import { UserUsage } from '../../domain/models/user-usage.models';

const FREE_DAILY_LIMIT = 7;

@Component({
  standalone: true,
  selector: 'app-user-profile-modal',
  imports: [CommonModule],
  templateUrl: './user-profile-modal.html',
  styleUrl: './user-profile-modal.scss',
})
export class UserProfileModal implements OnInit {
  @Output() close = new EventEmitter<void>();

  private readonly http = inject(HttpClient);
  protected readonly authService = inject(AuthService);

  protected readonly loading = signal(false);
  protected readonly deleteInProgress = signal(false);
  protected readonly showDeleteConfirm = signal(false);
  protected readonly showLogoutConfirm = signal(false);
  protected readonly usage = signal<UserUsage | null>(null);
  protected readonly usageText = computed(() => {
    const usage = this.usage();
    const user = this.authService.user();
    if (!usage || !user) {
      return '';
    }

    if (this.isSubscribedPlan()) {
      return 'Unlimited duas available with your current plan';
    }

    const remaining = Math.max(0, FREE_DAILY_LIMIT - usage.dailyRequests);
    return `${remaining}/${FREE_DAILY_LIMIT} duas left today · Upgrade for unlimited`;
  });
  protected readonly avatarInitials = computed(() => {
    const username = this.authService.user()?.username?.trim() ?? '';
    if (!username) {
      return 'U';
    }

    const parts = username.split(/\s+/).filter(Boolean);
    const initials = parts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');

    return initials || username.charAt(0).toUpperCase();
  });

  ngOnInit(): void {
    this.loadUsage();
  }

  protected closeModal(): void {
    this.close.emit();
  }

  protected beginLogout(): void {
    if (this.showLogoutConfirm()) {
      return;
    }

    this.showDeleteConfirm.set(false);
    this.showLogoutConfirm.set(true);
  }

  protected cancelLogout(): void {
    this.showLogoutConfirm.set(false);
  }

  protected confirmLogout(): void {
    this.authService.logout();
    this.closeModal();
  }

  protected beginDeleteAccount(): void {
    if (this.deleteInProgress() || this.showDeleteConfirm()) {
      return;
    }

    this.showLogoutConfirm.set(false);
    this.showDeleteConfirm.set(true);
  }

  protected cancelDeleteAccount(): void {
    if (this.deleteInProgress()) {
      return;
    }

    this.showDeleteConfirm.set(false);
  }

  protected confirmDeleteAccount(): void {
    if (this.deleteInProgress()) {
      return;
    }

    this.deleteInProgress.set(true);
    this.authService.deleteAccount().subscribe((success) => {
      this.deleteInProgress.set(false);
      if (success) {
        this.closeModal();
      } else {
        this.showDeleteConfirm.set(false);
      }
    });
  }

  protected onUpgrade(): void {
    this.authService.setShowPlanModal(true);
    this.closeModal();
  }

  protected planLabel(): string {
    const plan = this.authService.user()?.plan?.toLowerCase();
    return plan === 'subscribed' ? 'Subscribed Plan' : 'Free Plan';
  }

  protected isSubscribedPlan(): boolean {
    return this.authService.user()?.plan?.toLowerCase() === 'subscribed';
  }

  private loadUsage(): void {
    const userId = this.authService.user()?.userId;
    if (!userId) {
      return;
    }

    this.loading.set(true);
    this.http
      .get<UserUsage>(`${environment.apiUrl}/UserUsage/${userId}`)
      .pipe(
        catchError((error) => {
          console.error('Failed to load user usage', error);
          return of(null);
        })
      )
      .subscribe((usage) => {
        this.loading.set(false);
        if (usage) {
          this.usage.set(usage);
        }
      });
  }
}
