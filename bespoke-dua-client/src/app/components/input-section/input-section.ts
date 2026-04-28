import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { DuaService } from '../../domain/services/dua.service';
import { AuthService } from '../../domain/services/auth.service';
import { environment } from '../../../environments/environment';
import { UserUsage } from '../../domain/models/user-usage.models';

const FREE_DAILY_LIMIT = 7;

@Component({
  standalone: true,
  selector: 'app-input-section',
  imports: [CommonModule, FormsModule],
  templateUrl: './input-section.html',
  styleUrls: ['./input-section.scss'],
})
export class InputSection {
  private readonly http = inject(HttpClient);

  constructor(protected duaService: DuaService, private authService: AuthService) {}
  text = '';
  showAimModal = signal(false);
  showUsageInfoModal = signal(false);
  emptyInputMessage = false;
  usage = signal<UserUsage | null>(null);
  isUsageLoading = signal(false);
  isSubscribedPlan = computed(() => this.authService.user()?.plan?.toLowerCase() === 'subscribed');
  hasReachedDailyLimit = computed(() => {
    if (this.isSubscribedPlan()) {
      return false;
    }

    const usage = this.usage();
    if (!usage) {
      return false;
    }

    return usage.dailyRequests >= FREE_DAILY_LIMIT;
  });
  isSubmitDisabled = computed(() => this.duaService.loading());
  remainingDuasText = computed(() => {
    if (this.isSubscribedPlan()) {
      return 'Unlimited duas';
    }

    const usage = this.usage();
    const usedCount = usage?.dailyRequests ?? 0;
    const remaining = Math.max(0, FREE_DAILY_LIMIT - usedCount);
    return `${remaining}/${FREE_DAILY_LIMIT} duas left`;
  });

  hasUser = computed(() => !!this.authService.user());

  private readonly usageEffect = effect(() => {
    const user = this.authService.user();
    if (!user) {
      this.usage.set(null);
      return;
    }

    if (user.plan?.toLowerCase() === 'subscribed') {
      this.usage.set(null);
      return;
    }

    this.loadUsage(user.userId);
  });

  submitDua(value: string) {
    if (!this.authService.user()) {
      this.authService.setShowAuthPage(true);
      return;
    }

    if (this.hasReachedDailyLimit()) {
      this.authService.setShowPlanModal(true);
      return;
    }

    const trimmed = value?.trim();

    if (!trimmed) {
      this.emptyInputMessage = true;
      return;
    }

    this.emptyInputMessage = false;

    this.duaService.clearDuas();

    const user = this.authService.user()!;
    this.duaService.generateDuas({ inputtedDuaText: trimmed, userId: user.userId })
      .subscribe((duas) => {
        if (duas.length > 0 && !this.isSubscribedPlan()) {
          this.usage.update((current) => {
            if (!current) {
              return current;
            }

            return {
              ...current,
              dailyRequests: current.dailyRequests + 1,
            };
          });
        }
        this.text = '';
      });
  }

  private loadUsage(userId: number): void {
    this.isUsageLoading.set(true);
    this.http
      .get<UserUsage>(`${environment.apiUrl}/UserUsage/${userId}`)
      .pipe(
        catchError((error) => {
          console.error('Failed to load user usage', error);
          return of(null);
        })
      )
      .subscribe((usage) => {
        this.isUsageLoading.set(false);
        if (usage) {
          this.usage.set(usage);
        }
      });
  }
}
