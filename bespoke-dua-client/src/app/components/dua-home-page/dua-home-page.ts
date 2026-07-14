import { Component, signal } from '@angular/core';
import { InputSection } from '../input-section/input-section';
import { DuaResult } from '../dua-result/dua-result';

/** Bump suffix (e.g. v2) when you want the modal to show again for everyone. */
const WHATS_NEW_STORAGE_KEY = 'bespoke-dua-whats-new-v1';
const WHATS_NEW_COOLDOWN_DAYS = 7;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

@Component({
  standalone: true,
  selector: 'app-dua-home-page',
  imports: [InputSection, DuaResult],
  templateUrl: './dua-home-page.html',
  styleUrl: './dua-home-page.scss',
})
export class DuaHomePage {
  protected readonly showWhatsNewModal = signal(false);

  constructor() {
    if (typeof localStorage !== 'undefined' && this.shouldShowWhatsNew()) {
      this.showWhatsNewModal.set(true);
    }
  }

  dismissWhatsNew(): void {
    this.markWhatsNewSeen();
    this.showWhatsNewModal.set(false);
  }

  protected onAppStoreClick(): void {
    this.markWhatsNewSeen();
    this.showWhatsNewModal.set(false);
  }

  private shouldShowWhatsNew(): boolean {
    const lastSeenRaw = localStorage.getItem(WHATS_NEW_STORAGE_KEY);
    if (!lastSeenRaw) {
      return true;
    }

    const lastSeenTimestamp = Number(lastSeenRaw);
    if (Number.isNaN(lastSeenTimestamp)) {
      return true;
    }

    const cooldownMs = WHATS_NEW_COOLDOWN_DAYS * MILLISECONDS_PER_DAY;
    return Date.now() - lastSeenTimestamp >= cooldownMs;
  }

  private markWhatsNewSeen(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(WHATS_NEW_STORAGE_KEY, Date.now().toString());
  }
}
