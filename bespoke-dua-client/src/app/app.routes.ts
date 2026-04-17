import { Routes } from '@angular/router';
import { DuaHomePage } from './components/dua-home-page/dua-home-page';
import { PrivacyPolicyPage } from './components/privacy-policy-page/privacy-policy-page';

export const routes: Routes = [
  { path: '', component: DuaHomePage },
  { path: 'privacy-policy', component: PrivacyPolicyPage },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
