import { Component, signal } from '@angular/core';
import { InputSection } from '../input-section/input-section';
import { DuaResult } from '../dua-result/dua-result';

/** Bump suffix (e.g. v2) when you want the modal to show again for everyone. */
const WHATS_NEW_STORAGE_KEY = 'bespoke-dua-whats-new-v1';

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
    if (typeof localStorage !== 'undefined' && !localStorage.getItem(WHATS_NEW_STORAGE_KEY)) {
      this.showWhatsNewModal.set(true);
    }
  }

  dismissWhatsNew(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(WHATS_NEW_STORAGE_KEY, '1');
    }
    this.showWhatsNewModal.set(false);
  }
}
