import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'],
})
export class Footer {
  constructor(private readonly router: Router) {}

  navigateToPolicy(event: Event, route: string): void {
    event.preventDefault();
    this.router.navigateByUrl(route);
  }
}
