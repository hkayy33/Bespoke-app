import { Component, ElementRef, EventEmitter, Output, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../domain/services/auth.service';

type PlanType = 'free' | 'plus';

@Component({
  standalone: true,
  selector: 'app-plan-modal',
  imports: [CommonModule],
  templateUrl: './plan-modal.html',
  styleUrl: './plan-modal.scss',
})
export class PlanModal {
  @Output() close = new EventEmitter<void>();
  @ViewChild('plusPlanCard') private plusPlanCard?: ElementRef<HTMLButtonElement>;

  private readonly authService = inject(AuthService);
  protected readonly currentPlan = computed<PlanType>(() =>
    this.authService.user()?.plan?.toLowerCase() === 'subscribed' ? 'plus' : 'free'
  );
  protected readonly selectedPlan = signal<PlanType>(this.currentPlan());
  protected readonly upgradeButtonLabel = computed(() =>
    this.selectedPlan() === 'plus'
      ? 'Upgrade to BespokeDua Plus (coming soon)'
      : 'Upgrade plan (coming soon)'
  );

  constructor() {
    effect(() => {
      this.selectedPlan.set(this.currentPlan());
    });
  }

  protected selectPlan(plan: PlanType): void {
    this.selectedPlan.set(plan);
  }

  protected closeModal(): void {
    this.close.emit();
  }

  protected onUpgrade(): void {
    this.selectedPlan.set('plus');
    this.plusPlanCard?.nativeElement.focus();
  }
}
