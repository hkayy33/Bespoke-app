import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { DuaService } from '../../../domain/services/dua.service';
import { DuaReciever } from '../../../domain/models/dua-reciever';

const TRY_STORAGE_KEY = 'bespoke-dua-try-me';
const DAILY_TRY_LIMIT = 4;

type TryUsage = { date: string; count: number };

@Component({
  selector: 'app-redirect-page',
  imports: [FormsModule],
  templateUrl: './redirect-page.html',
  styleUrl: './redirect-page.scss',
})
export class RedirectPage {
  private readonly duaService = inject(DuaService);

  readonly appStoreUrl = environment.appStoreUrl;
  readonly dailyLimit = DAILY_TRY_LIMIT;

  readonly intention = signal('');
  readonly usedCount = signal(this.readUsage().count);
  readonly results = signal<DuaReciever[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly copiedIndex = signal<number | null>(null);

  readonly remaining = computed(() => Math.max(0, DAILY_TRY_LIMIT - this.usedCount()));
  readonly limitReached = computed(() => this.remaining() <= 0);
  readonly canSubmit = computed(
    () => !this.loading() && !this.limitReached() && this.intention().trim().length >= 8
  );

  generate(): void {
    if (!this.canSubmit()) {
      if (this.limitReached()) {
        this.error.set(
          `You’ve used your ${DAILY_TRY_LIMIT} free tries for today. Download the app for more.`
        );
      } else if (this.intention().trim().length < 8) {
        this.error.set('Share a little more about what’s on your heart (a short sentence is enough).');
      }
      return;
    }

    const text = this.intention().trim();
    this.loading.set(true);
    this.error.set(null);
    this.results.set([]);
    this.copiedIndex.set(null);

    this.duaService.generateDuas({ inputtedDuaText: text }).subscribe({
      next: (duas) => {
        this.loading.set(false);
        if (!duas.length) {
          this.error.set(this.duaService.error() || 'Something went wrong. Please try again.');
          return;
        }
        this.results.set(duas);
        this.usedCount.set(this.bumpUsage());
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Something went wrong. Please try again.');
      },
    });
  }

  clearResults(): void {
    this.results.set([]);
    this.copiedIndex.set(null);
    this.duaService.clearDuas();
  }

  copyDua(text: string, index: number): void {
    void navigator.clipboard.writeText(text).then(() => {
      this.copiedIndex.set(index);
      window.setTimeout(() => {
        if (this.copiedIndex() === index) {
          this.copiedIndex.set(null);
        }
      }, 1800);
    });
  }

  private todayKey(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private readUsage(): TryUsage {
    const today = this.todayKey();
    try {
      const raw = localStorage.getItem(TRY_STORAGE_KEY);
      if (!raw) {
        return { date: today, count: 0 };
      }
      const parsed = JSON.parse(raw) as TryUsage;
      if (parsed?.date !== today || typeof parsed.count !== 'number') {
        return { date: today, count: 0 };
      }
      return { date: today, count: Math.min(DAILY_TRY_LIMIT, Math.max(0, parsed.count)) };
    } catch {
      return { date: today, count: 0 };
    }
  }

  private bumpUsage(): number {
    const today = this.todayKey();
    const next = Math.min(DAILY_TRY_LIMIT, this.readUsage().count + 1);
    localStorage.setItem(TRY_STORAGE_KEY, JSON.stringify({ date: today, count: next }));
    return next;
  }
}
