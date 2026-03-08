import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBar } from './shared/nav-bar/nav-bar';
import { InputSection } from './components/input-section/input-section';
import { DuaResult } from './components/dua-result/dua-result';
import { inject } from '@vercel/analytics';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBar, InputSection, DuaResult],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('bespoke-dua-client');

  constructor() {
    // Initialize Vercel Web Analytics
    inject();
  }
}
