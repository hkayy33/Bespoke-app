import { Routes } from '@angular/router';
import { AuthCallbackPage } from './components/auth-callback/auth-callback';
import { DuaHomePage } from './components/dua-home-page/dua-home-page';
import { PrivacyPolicyPage } from './components/privacy-policy-page/privacy-policy-page';
import { RefundPolicyPage } from './components/refund-policy-page/refund-policy-page';
import { TermsAndConditionsPage } from './components/terms-and-conditions-page/terms-and-conditions-page';

export const routes: Routes = [
  { path: 'auth/callback', component: AuthCallbackPage },
  { path: '', component: DuaHomePage },
  { path: 'privacy-policy', component: PrivacyPolicyPage },
  { path: 'refund-policy', component: RefundPolicyPage },
  { path: 'terms-and-conditions', component: TermsAndConditionsPage },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
