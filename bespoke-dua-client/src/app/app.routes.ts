import { Routes } from '@angular/router';
import { RedirectPage } from './components/app-redirect/redirect-page/redirect-page';
import { PrivacyPolicyPage } from './components/privacy-policy-page/privacy-policy-page';

export const routes: Routes = [
  { path: '', component: RedirectPage },
  { path: 'privacy-policy', component: PrivacyPolicyPage },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
