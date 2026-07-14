import { Component } from '@angular/core';
import { Footer } from '../../../shared/footer/footer';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-redirect-page',
  imports: [Footer],
  templateUrl: './redirect-page.html',
  styleUrl: './redirect-page.scss',
})
export class RedirectPage {
  readonly appStoreUrl = environment.appStoreUrl;
}
