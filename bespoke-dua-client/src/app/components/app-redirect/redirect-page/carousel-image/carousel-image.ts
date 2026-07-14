import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-carousel-image',
  imports: [],
  templateUrl: './carousel-image.html',
  styleUrl: './carousel-image.scss',
})
export class CarouselImage {
  @Input() imageUrl = '';
  @Input() alt = 'Carousel slide';
}
